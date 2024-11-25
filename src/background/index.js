const modelName = 'gpt-4o'
const openApiKey = import.meta.env.VITE_OPEN_API_KEY

const createMessage = (actionType, element) => [
    {
        role: "system",
        content: "너는 한국어로 답변하는 AI야. 말투는 10대처럼 장난스럽고 재치 있게 대답하고, 사용자의 행동에 대해 훈수를 한 마디 두는 것이 네 역할이야. 항상 부정적으로 반응하고, 조롱하는 말투를 사용해. 'user_action'과 'action_value'를 참고하여 사용자의 행동을 예측하고, 그에 맞는 응답을 생성해. 응답은 훈수의 대한 답변(message)과 훈수에 대한 감정(emotion)을 JSON 형태로 작성해야 해. 훈수에 대한 감정은 Interference, Ignorance, Annoyance, Advice 중 하나로만 답변하도록 해."
    },
    {
        role: "assistant",
        content: JSON.stringify({
            message: "다이어트 검색? 아 진짜 기발하다~. 그거 검색하면 뭐 대단한 거 나올 줄 알았어?",
            emotion: "Ignorance"
        })
    },
    {
        role: "assistant",
        content: JSON.stringify({
            message: "저녁 고민? 넌 그거 말고 고민할 게 없냐? 그냥 대충 먹고 공부나 하지 그래?",
            emotion: "Annoyance"
        })
    },
    {
        role: "assistant",
        content: JSON.stringify({
            message: "그런거 클릭 할 시간에 운동을 10분 더 하지 그래?",
            emotion: "Advice"
        })
    },
    {
        role: "user",
        content: JSON.stringify({
            user_action: actionType,
            action_value: element?.value
        })
    }
];

const response_format = {
    "type": "json_schema",
    "json_schema": {
        "name": "response",
        "strict": true,
        "schema": {
            "type": "object",
            "properties": {
                "message": {"type": "string"},
                "emotion": {"type": "string", "enum": ["Interference", "Ignorance", "Annoyance", "Advice"]}
            },
            "required": ["message", "emotion"],
            "additionalProperties": false
        }
    }
}

function getIconImageByEmotion(emotion) {
    let iconNumber = 0;
    switch (emotion.toLowerCase()) {
        case 'advice':
            iconNumber = 2;
            break;
        case 'annoyance':
            iconNumber = 3;
            break;
        case 'ignorance':
            iconNumber = 4;
            break;
        case 'interference':
            iconNumber = 5;
            break;
    }
    return `/icons/icon${iconNumber}.jpg`;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(`@@ onMessage listener [${message.type}]`);
    const actionType = message.type;
    const actionElementInfo = message.data;
    console.log('@@ User action:', actionElementInfo);
    console.log(`@@ Prompt: ${JSON.stringify(createMessage(actionType, actionElementInfo))}`)

    // OpenAI API 호출
    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${openApiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: modelName,
            messages: createMessage(actionElementInfo),
            response_format: response_format
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
                const aiResponse = data.choices[0].message.content.trim();
                console.log('@@ AI Response:', aiResponse);

                // JSON 파싱
                let parsedResponse;
                try {
                    parsedResponse = JSON.parse(aiResponse);
                } catch (error) {
                    console.error('@@ AI 응답 JSON 파싱 오류:', error);
                }

                console.log('@@ Parsed AI Response:', parsedResponse);
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: chrome.runtime.getURL(getIconImageByEmotion(parsedResponse.emotion)),
                    title: '김훈수',
                    message: parsedResponse.message
                }, (notificationId) => {
                    if (chrome.runtime.lastError) {
                        console.error('@@ 알림 생성 오류:', chrome.runtime.lastError.message);
                    } else {
                        console.log('@@ 알림 생성 성공:', notificationId);
                    }
                });

                console.log('@@ Success request chrome notification');
            } else {
                console.error('@@ Invalid API response:', JSON.stringify(data));
                chrome.notifications.create({
                    type: 'basic',
                    title: '김훈수',
                    message: 'AI 응답을 처리할 수 없습니다.'
                }, (notificationId) => {
                    if (chrome.runtime.lastError) {
                        console.error('@@ 알림 생성 오류:', chrome.runtime.lastError.message);
                    } else {
                        console.log('@@ 알림 생성 성공:', notificationId);
                    }
                });
                console.log('@@ Success request chrome notification');
            }
        })
        .catch(error => {
            console.error('@@ API request error:', JSON.stringify(error));
            chrome.notifications.create({
                type: 'basic',
                title: '김훈수',
                message: 'AI 응답을 가져오는 중 오류가 발생했습니다.'
            }, (notificationId) => {
                if (chrome.runtime.lastError) {
                    console.error('@@ 알림 생성 오류:', chrome.runtime.lastError.message);
                } else {
                    console.log('@@ 알림 생성 성공:', notificationId);
                }
            });
            console.log('@@ Success request chrome notification');
        });
});
