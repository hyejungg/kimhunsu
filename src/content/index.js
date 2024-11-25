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

    clearTimeout(debounceTimeout); // 기존 타이머 취소
    debounceTimeout = setTimeout(() => {
        console.log('@@ Debounced event triggered');
        // 클릭 정보를 백그라운드 스크립트로 전달
        chrome.runtime.sendMessage({
            type: 'click',
            data: elementInfo
        });
    }, 6000); // 6000ms (60s) 지연
});

// 입력 감지
document.addEventListener('keydown', (event) => {
    console.log('@@ eventListener [keydown]');
    // 현재 입력 중인 요소를 감지 (input 또는 textarea)
    const activeElement = document.activeElement;

    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
        if (event.key === 'Enter') {
            const elementInfo = {
                tagName: activeElement.tagName,
                id: activeElement.id,
                classList: Array.from(activeElement.classList),
                value: activeElement.value,
            };

            // 입력된 값을 백그라운드 스크립트로 전달
            chrome.runtime.sendMessage({
                type: 'search',
                data: elementInfo
            });
        }
    }
});
