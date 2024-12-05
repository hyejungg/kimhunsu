let debounceTimeout;

// 클릭 이벤트를 감지
document.addEventListener('click', (event) => {
    console.log('@@ eventListener [click]');
    const elementInfo = {
        tagName: event.target.tagName,
        id: event.target.id,
        classList: Array.from(event.target.classList),
        value: event.target.outerHTML
    };

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        console.log('@@ Debounced event triggered');
        chrome.runtime.sendMessage({
            type: 'click',
            data: elementInfo
        });
    }, 6000); // 60s
});

// 입력 감지
document.addEventListener('keydown', (event) => {
    console.log('@@ eventListener [keydown]');
    const activeElement = document.activeElement;

    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
        if (event.key === 'Enter') {
            const elementInfo = {
                tagName: activeElement.tagName,
                id: activeElement.id,
                classList: Array.from(activeElement.classList),
                value: activeElement.value,
            };
            chrome.runtime.sendMessage({
                type: 'search',
                data: elementInfo
            });
        }
    }
});
