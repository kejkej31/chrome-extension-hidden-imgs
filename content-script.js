const DEBUG = false;


chrome.runtime.onMessage.addListener(async function (msg, sender, sendResponse) {
    console.log(msg);
    if (msg.event === "copyImageUrl") {
        try {
            await navigator.clipboard.writeText(msg.imgUrl);
        }
        catch (NotAllowedError) {
            //
        }
    }
});

document.addEventListener("mousedown", event => {
    if (event.button !== 2) {
        return;
    }
    const imgUrls = new Set();
    document.elementsFromPoint(event.clientX, event.clientY)
        .forEach((el) => {
            if (DEBUG) console.log(el);
            if (el.matches("img") && el.src) {
                imgUrls.add(el.src);
                return true;
            }
            const pseudoElementAttrs = [null, ':before', ':after'];
            pseudoElementAttrs.forEach((pseudoElementAttr) => {
                const backgroundImg = getComputedStyle(el, pseudoElementAttr).getPropertyValue('background-image');
                if (backgroundImg) {
                    const regex = /url\(['"](.*?)['"]\)/;
                    const matches = regex.exec(backgroundImg);
                    if (matches && matches[1] !== undefined) {
                        imgUrls.add(matches[1])
                    }
                    return true;
                }
            });

        });
    try {
        if (imgUrls.size > 0) {
            var iterator = imgUrls.values();
            chrome.runtime?.sendMessage({ event: 'updateContextMenu', imgUrl: iterator.next().value });
        } else {
            chrome.runtime?.sendMessage({ event: 'removeContextMenu' });
        }
    } catch (e) {
        if (DEBUG || e.message !== "Extension context invalidated.") {
            throw e;
        }
    }
});