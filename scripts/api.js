import { STATE } from './globals.js';
import { ui } from './ui.js';

export async function fetchInterpretation() {
    const cardsDesc = STATE.selectedCards.map((c, i) => {
        const pos = ["过去/原因", "现在/过程", "未来/结果"][i];
        return `${pos}: ${c.name} (${c.orientation})`;
    }).join("\n");

    const prompt = `你是一位神秘、深刻且富有同理心的专业塔罗师。请根据以下牌阵为求问者进行解读。

牌阵信息：
${cardsDesc}

要求：
1. 语气神秘、优雅、具有仪式感。
2. 先分别简述每张牌的含义。
3. 重点分析三张牌之间的联系和整体启示。
4. 使用 Markdown 格式输出。
`;

    // 如果没有 Key，显示模拟文本
    if (!STATE.apiKey) {
        streamText(`**模拟解读模式（未检测到 API Key）**\n\n${cardsDesc}\n\n此处应由 Qwen 大模型生成深度解析。请在左下角输入 Key 以体验完整功能。\n\n**示例解读：**\n这三张牌揭示了你正处于一个转折点...（此处省略1000字）`);
        return;
    }

    try {
        const response = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${STATE.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "qwen-plus",
                messages: [
                    { role: "system", content: "你是一位精通塔罗牌的神秘学家。" },
                    { role: "user", content: prompt }
                ],
                stream: true
            })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });

            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const jsonStr = line.slice(6);
                    if (jsonStr === '[DONE]') break;
                    try {
                        const json = JSON.parse(jsonStr);
                        const content = json.choices[0].delta.content || "";
                        fullText += content;
                        // 使用 marked 库解析 markdown (全局对象)
                        ui.aiText.innerHTML = marked.parse(fullText);
                        document.getElementById('result-content').scrollTop = document.getElementById('result-content').scrollHeight;
                    } catch (e) { }
                }
            }
        }

    } catch (error) {
        ui.aiText.innerText = "与宇宙意识连接中断... 请检查网络或 API Key。\n" + error.message;
    }
}

function streamText(text) {
    ui.aiText.innerHTML = marked.parse(text);
}