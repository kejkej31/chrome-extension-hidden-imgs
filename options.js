const saveOption = (event) => {
    chrome.runtime.sendMessage({
        event: 'functionUpdated',
        function: event.target.name,
        status: event.target.checked
    });
    const checkboxes = document.querySelectorAll('#functions input[type="checkbox"]:checked');
    const enabledFunctions = Array.from(checkboxes).map(el => el.name);

    chrome.storage.sync.set(
        { enabledFunctions },
    );
};

const restoreOptions = () => {
    chrome.storage.sync.get(
        { enabledFunctions: [] },
        ({ enabledFunctions }) => {
            const checkboxes = document.querySelectorAll('#functions input[type="checkbox"]');
            checkboxes.forEach((input) => {
                if (enabledFunctions.includes(input.name)) {
                    input.checked = true;
                }
            });
        }
    );
};

document.addEventListener('DOMContentLoaded', function () {
    restoreOptions();
    document.querySelectorAll('#functions input[type="checkbox"]').forEach((input) => {
        input.addEventListener('change', saveOption);
    });
});