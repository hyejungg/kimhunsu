// src/store/index.js
import { defineStore } from 'pinia';

export const useAdviceStore = defineStore('advice', {
    state: () => ({
        adviceMessages: [] // 훈수 메시지를 저장할 배열
    }),
    actions: {
        addAdviceMessage(message) {
            this.state.adviceMessages.push(message);
        }
    },
    getters: {
        getAllAdviceMessages: (state) => this.state.adviceMessages
    }
});
