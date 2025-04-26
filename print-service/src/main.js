const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const express = require('express');
const cors = require('cors');
const { ThermalPrinter, PrinterTypes, CharacterSet } = require('node-thermal-printer');
const path = require('path');
const fs = require('fs');

// Configuração do servidor Express
const server = express();
server.use(cors());
server.use(express.json());

let tray = null;
let mainWindow = null;
let printer = null;

// Caminho para o arquivo de configuração
const configPath = path.join(app.getPath('userData'), 'config.json');

// Configuração padrão
const defaultConfig = {
    type: PrinterTypes.EPSON,
    interface: 'printer:EPSON',
    characterSet: CharacterSet.PC860_PORTUGUESE,
    removeSpecialCharacters: false,
    options: {
        timeout: 5000
    }
};

// Carregar configuração
function loadConfig() {
    try {
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            return { ...defaultConfig, ...config };
        }
    } catch (error) {
        console.error('Erro ao carregar configuração:', error);
    }
    return defaultConfig;
}

// Salvar configuração
function saveConfig(config) {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao salvar configuração:', error);
        return false;
    }
}

// Inicializar impressora
function initializePrinter(config) {
    try {
        printer = new ThermalPrinter(config);
        return true;
    } catch (error) {
        console.error('Erro ao inicializar impressora:', error);
        return false;
    }
}

// Imprimir teste
async function printTest() {
    try {
        await printer.clear();
        await printer.alignCenter();
        await printer.bold(true);
        await printer.println('TESTE DE IMPRESSÃO');
        await printer.bold(false);
        await printer.println('--------------------------------');
        await printer.alignLeft();
        await printer.println('Data: ' + new Date().toLocaleString());
        await printer.println('Impressora: ' + printer.interface);
        await printer.println('--------------------------------');
        await printer.alignCenter();
        await printer.println('Configuração OK!');
        await printer.cut();
        await printer.execute();
        return true;
    } catch (error) {
        console.error('Erro ao imprimir teste:', error);
        return false;
    }
}

// Listar impressoras disponíveis
function listPrinters() {
    try {
        const { execSync } = require('child_process');
        const printers = execSync('wmic printer get name').toString();
        return printers.split('\r\r\n')
            .map(p => p.trim())
            .filter(p => p && p !== 'Name');
    } catch (error) {
        console.error('Erro ao listar impressoras:', error);
        return [];
    }
}

// Rota para imprimir cupom
server.post('/print', async (req, res) => {
    try {
        const { venda } = req.body;

        await printer.clear();

        // Cabeçalho
        await printer.alignCenter();
        await printer.bold(true);
        await printer.println('CASA BURITI');
        await printer.bold(false);
        await printer.println('--------------------------------');

        // Informações do evento
        await printer.alignLeft();
        await printer.println(`Evento: ${venda.evento.nome}`);
        await printer.println(`Data: ${new Date().toLocaleString()}`);
        await printer.println('--------------------------------');

        // Itens
        await printer.println('ITENS:');
        for (const item of venda.itens) {
            await printer.tableCustom([
                { text: item.produto.nome, align: 'LEFT', width: 0.5 },
                { text: `${item.quantidade}x`, align: 'CENTER', width: 0.2 },
                { text: `R$ ${(item.valor * item.quantidade).toFixed(2)}`, align: 'RIGHT', width: 0.3 }
            ]);
        }

        await printer.println('--------------------------------');

        // Total
        await printer.alignRight();
        await printer.bold(true);
        await printer.println(`TOTAL: R$ ${venda.valorTotal.toFixed(2)}`);
        await printer.bold(false);

        // Forma de pagamento
        await printer.println(`Forma de Pagamento: ${venda.formaPagamento}`);

        // Rodapé
        await printer.alignCenter();
        await printer.println('--------------------------------');
        await printer.println('Obrigado pela compra!');

        // Cortar papel
        await printer.cut();

        // Executar impressão
        await printer.execute();

        res.json({ success: true, message: 'Cupom impresso com sucesso!' });
    } catch (error) {
        console.error('Erro ao imprimir:', error);
        res.status(500).json({ success: false, message: 'Erro ao imprimir cupom', error: error.message });
    }
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('src/index.html');

    // Adiciona o evento close na janela após ela ser criada
    mainWindow.on('close', (e) => {
        e.preventDefault(); // Previne o fechamento da janela
        mainWindow.hide(); // Apenas esconde a janela
    });
}

function createTray() {
    tray = new Tray(path.join(__dirname, '../assets/icon.png'));
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Serviço de Impressão Casa Buriti', enabled: false },
        { type: 'separator' },
        { label: 'Configurar Impressora', click: () => mainWindow.show() },
        { type: 'separator' },
        { label: 'Sair', click: () => app.quit() }
    ]);
    tray.setToolTip('Serviço de Impressão Casa Buriti');
    tray.setContextMenu(contextMenu);
}

// Eventos IPC
ipcMain.on('get-config', (event) => {
    const config = loadConfig();
    event.reply('config', config);
});

ipcMain.on('save-config', (event, config) => {
    if (saveConfig(config)) {
        if (initializePrinter(config)) {
            event.reply('status', {
                success: true,
                message: 'Configuração salva com sucesso!'
            });
        } else {
            event.reply('status', {
                success: false,
                message: 'Erro ao inicializar impressora'
            });
        }
    } else {
        event.reply('status', {
            success: false,
            message: 'Erro ao salvar configuração'
        });
    }
});

ipcMain.on('test-print', async (event) => {
    if (await printTest()) {
        event.reply('status', {
            success: true,
            message: 'Teste impresso com sucesso!'
        });
    } else {
        event.reply('status', {
            success: false,
            message: 'Erro ao imprimir teste'
        });
    }
});

ipcMain.on('list-printers', (event) => {
    const printers = listPrinters();
    event.reply('printers-list', printers);
});

app.whenReady().then(() => {
    // Carregar configuração inicial
    const config = loadConfig();
    initializePrinter(config);

    createWindow();
    createTray();

    // Iniciar servidor na porta 8338
    server.listen(8338, () => {
        console.log('Servidor de impressão rodando na porta 8338');
    });
});

app.on('window-all-closed', (e) => {
    e.preventDefault(); // Previne o fechamento do aplicativo
});

app.on('activate', () => {
    if (!mainWindow) {
        createWindow();
    } else {
        mainWindow.show();
    }
}); 