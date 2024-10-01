const DEBUG = true;

const menus = [
    { id: "OpenImage", title: '⬆ Open', menuId: null, action: openImage, enabled: true },
    { id: "DownloadImage", title: '⭳ Download', menuId: null, action: downloadImage, enabled: true },
    { id: "CopyImageUrl", title: '⎘ Copy', menuId: null, action: copyImageUrl, enabled: true },
];
var imgUrl = null;

chrome.storage.sync.get(
    { enabledFunctions: [] },
    ({ enabledFunctions }) => {
        menus.forEach((menu) => {
            menu.enabled = enabledFunctions.includes(menu.id);
        });
    }
);

chrome.contextMenus.onClicked.addListener(onClicked);

function onClicked(info) {
    menus.forEach((menu) => {
        if (menu.id === info.menuItemId) {
            menu.action();
        }
    });
}

async function copyImageUrl() {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    chrome.tabs.sendMessage(tab.id, { event: 'copyImageUrl', imgUrl });
}

function openImage() {
    chrome.tabs.create(
        {
            active: true,
            url: imgUrl,
        }
    )
}

function downloadImage() {
    chrome.downloads.download(
        {
            url: imgUrl,
        },
    )
}

const contexts = [
    'page',
    'selection',
    'image',
    'link',
    'editable',
    'video',
    'audio'
];

chrome.tabs.onActivated.addListener(
    () => {
        removeMenu();
    }
)

const removeMenu = (id) => {
    if (id) {
        const menu = menus.find((menu) => menu.id === id);
        if (menu.menuId === null) return;
        chrome.contextMenus.remove(menu.menuId, () => {
            menu.menuId = null;
        });
        return;
    }
    menus.forEach((menu) => {
        if (menu.menuId === null) return;
        chrome.contextMenus.remove(menu.menuId, () => {
            menu.menuId = null;
        });
    });
}


chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (DEBUG) console.log(msg, menus);
    imgUrl = msg.imgUrl ?? null;

    if (msg.event === 'functionUpdated') {
        const ind = menus.findIndex((menu) => menu.id === msg.function)
        menus[ind].enabled = msg.status;
        if (menus[ind].enabled === false && menus[ind].menuId !== null) {
            removeMenu(msg.function);
        }
    }

    if (msg.event === 'removeContextMenu') {
        removeMenu();
    }

    if (msg.event === 'updateContextMenu') {
        const filename = msg.imgUrl ? new URL(msg.imgUrl).pathname.split('/').pop() : null;
        const titleGen = (title, filename) => `${title} ${filename}`;
        menus.filter((menu) => menu.menuId === null && menu.enabled === true).forEach((menu) => {
            menu.menuId = chrome.contextMenus.create({
                id: menu.id,
                title: titleGen(menu.title, filename),
                contexts,
            });
        });
        menus.filter((menu) => menu.menuId !== null).forEach((menu) => {
            chrome.contextMenus.update(menu.menuId, {
                title: titleGen(menu.title, filename),
            });
        });

    }
});