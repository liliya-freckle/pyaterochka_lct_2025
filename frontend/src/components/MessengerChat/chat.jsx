// import React, { useEffect, useRef, useState } from "react";
// import "./chat.css";
// import TimeZone from "../TimeZone/TimeZone.jsx";

// const BOT_IMG = "./bot.svg";
// const PERSON_IMG = "./user.svg";
// const BOT_NAME = "БOT";
// const PERSON_NAME = "Пользователь";

// const escapeHtml = (s) =>
//   String(s).replace(
//     /[&<>"']/g,
//     (c) =>
//       ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
//         c
//       ])
//   );

// const pad2 = (n) => String(n).padStart(2, "0");
// const nowHHMM = () => {
//   const d = new Date();
//   return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
// };
// const uid = () => Math.random().toString(36).slice(2);

// function productToText(p) {
//   if (!p || typeof p !== "object") return "";
//   const name = p.name || p.title || p.product_name || "Товар";
//   const brand = p.brand || p.manufacturer || "";
//   const fat = p.fat || p.fatness || p.fat_content || "";
//   const volume = p.volume || p.size || p.package || "";
//   const price = p.price != null ? `${p.price} ${p.currency || "₽"}` : "";
//   const desc = p.description || p.short_description || "";

//   return [
//     `• ${name}${brand ? `, ${brand}` : ""}`,
//     fat ? `Жирность: ${fat}` : "",
//     volume ? `Объём/вес: ${volume}` : "",
//     price ? `Цена: ${price}` : "",
//     desc ? `Описание: ${desc}` : "",
//   ]
//     .filter(Boolean)
//     .join("\n");
// }

// function extractProducts(data) {
//   if (!data) return [];
//   if (Array.isArray(data.products)) return data.products;
//   if (data.product && typeof data.product === "object") return [data.product];
//   return [];
// }

// export default function MessengerChat({
//   headerTitle = "Ваш персональный помощник",
//   logoSrc = "/logo.svg",
//   mock = false,
// }) {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState(() => [
//     {
//       id: uid(),
//       side: "left",
//       name: BOT_NAME,
//       img: BOT_IMG,
//       time: nowHHMM(),
//       text:
//         "Здравствуйте! Я помогу Вам выбрать необходимые продукты.\n" +
//         "Напишите, например: «молоко 2.5% 1 л Простоквашино».",
//     },
//   ]);

//   const chatRef = useRef(null);

//   useEffect(() => {
//     if (chatRef.current) {
//       chatRef.current.scrollTop = chatRef.current.scrollHeight;
//     }
//   }, [messages.length]);

//   const appendMessage = (name, img, side, text, { dedupeBot = true } = {}) => {
//     if (dedupeBot && side === "left") {
//       const lastBot = [...messages].reverse().find((m) => m.side === "left");
//       if (lastBot && lastBot.text.trim() === String(text).trim()) return;
//     }
//     setMessages((prev) => [
//       ...prev,
//       { id: uid(), side, name, img, time: nowHHMM(), text },
//     ]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const msgText = input.trim();
//     if (!msgText) return;

//     appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText, {
//       dedupeBot: false,
//     });
//     setInput("");

//     if (mock) {
//       appendMessage(BOT_NAME, BOT_IMG, "left", "Мок-режим: mock=true");
//       return;
//     }

//     try {
//       const history = []; // без контекста
//       const res = await fetch("/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message: msgText, history }),
//       });

//       const code = res.status;
//       const ct = (res.headers.get("content-type") || "").toLowerCase();
//       const raw = await res.text();

//       let data = null;
//       try {
//         data = JSON.parse(raw);
//       } catch {
//         data = null;
//       }

//       if (!res.ok) {
//         appendMessage(
//           BOT_NAME,
//           BOT_IMG,
//           "left",
//           `Ошибка сервера: ${code}\nContent-Type: ${ct}\n${raw.slice(0, 200)}`
//         );
//         return;
//       }

//       // 1) Картинка + атрибуты
//       const resp = data && data.response ? data.response : data;
//       if (resp) {
//         const imgHtml = resp.image
//           ? `<img src="${resp.image}" alt="product" style="max-width:120px;border-radius:8px;display:block;margin-bottom:8px;" />`
//           : "";

//         const pairs = [
//           ["Тип", resp.type],
//           ["Бренд", resp.brand],
//           ["Объём", resp.volume],
//           ["Жирность", resp.percent],
//         ];

//         const linesHtml = pairs
//           .filter(
//             ([, v]) => v !== undefined && v !== null && String(v).trim() !== ""
//           )
//           .map(([k, v]) => `<div>• ${k}: ${escapeHtml(v)}</div>`)
//           .join("");

//         if (imgHtml || linesHtml) {
//           appendMessage(
//             BOT_NAME,
//             BOT_IMG,
//             "left",
//             `<div>${imgHtml}${linesHtml}</div>`,
//             { dedupeBot: false }
//           );
//         }
//       }

//       // 2) Товары (все для текущего ответа)
//       const products = extractProducts(data);
//       if (products.length) {
//         const formatted = products
//           .map((p) => productToText(p))
//           .filter(Boolean)
//           .join("\n\n");

//         if (formatted) {
//           appendMessage(BOT_NAME, BOT_IMG, "left", formatted);
//           return;
//         }
//         return;
//       }

//       // 3) Массив строк
//       if (Array.isArray(data)) {
//         const text = data
//           .filter((s) => typeof s === "string" && s.trim())
//           .map((s) => `• ${s}`)
//           .join("\n");
//         if (text) {
//           appendMessage(
//             BOT_NAME,
//             BOT_IMG,
//             "left",
//             `Нашла параметры запроса:\n${text}`
//           );
//         }
//         return;
//       }

//       // 4) Объект с линиями
//       if (data && typeof data === "object") {
//         const lines =
//           data.attributes || data.response_lines || data.data || data.result;
//         if (Array.isArray(lines)) {
//           const text = lines
//             .filter((s) => typeof s === "string" && s.trim())
//             .map((s) => `• ${s}`)
//             .join("\n");
//           if (text) {
//             appendMessage(
//               BOT_NAME,
//               BOT_IMG,
//               "left",
//               `Нашла параметры запроса:\n${text}`
//             );
//           }
//           return;
//         }
//       }

//       // 5) Raw-текст
//       if (typeof raw === "string" && raw.trim()) {
//         const maybeLines = raw
//           .split(/\r?\n/)
//           .map((s) => s.trim())
//           .filter(Boolean);
//         if (
//           maybeLines.length >= 2 &&
//           maybeLines.some((s) => s.includes(" - "))
//         ) {
//           const text = maybeLines.map((s) => `• ${s}`).join("\n");
//           appendMessage(
//             BOT_NAME,
//             BOT_IMG,
//             "left",
//             `Нашла параметры запроса:\n${text}`
//           );
//           return;
//         }
//         appendMessage(BOT_NAME, BOT_IMG, "left", raw.slice(0, 400));
//         return;
//       }

//       // 6) Нераспознанный формат
//       appendMessage(
//         BOT_NAME,
//         BOT_IMG,
//         "left",
//         `Неожиданный ответ сервера (не распознан формат)\nStatus: ${code}\nContent-Type: ${ct}\n${raw.slice(
//           0,
//           200
//         )}`
//       );
//     } catch (err) {
//       console.error("fetch error:", err);
//       appendMessage(BOT_NAME, BOT_IMG, "left", "Ошибка соединения с сервером");
//     }
//   };

//   const sendBtnStyle = { backgroundColor: "#4CAF50" };

//   return (
//     <section className="msger" aria-label="Chat">
//       <header className="msger-header">
//         <div className="msger-header-title">
//           <i className="fas fa-comment-alt" aria-hidden="true"></i>
//           <img src={logoSrc} alt="logo" />
//           {headerTitle}
//         </div>
//         <div className="msger-header-options">
//           <span>
//             <i className="fas fa-cog" aria-hidden="true"></i>
//           </span>
//         </div>
//       </header>

//       <main className="msger-chat" ref={chatRef} aria-live="polite">
//         {messages.map((m) => (
//           <div key={m.id} className={`msg ${m.side}-msg`}>
//             <div
//               className="msg-img"
//               style={{ backgroundImage: `url(${m.img})` }}
//             />
//             <div className="msg-bubble">
//               <div className="msg-info">
//                 <div className="msg-info-name">{m.name}</div>
//                 <div className="msg-info-time">
//                   <span>{m.time}</span>
//                   <TimeZone compact />
//                 </div>
//               </div>
//               <div
//                 className="msg-text"
//                 style={{ whiteSpace: "pre-wrap" }}
//                 dangerouslySetInnerHTML={{ __html: m.text }}
//               />
//             </div>
//           </div>
//         ))}
//       </main>

//       <form className="msger-inputarea" onSubmit={handleSubmit}>
//         <input
//           type="text"
//           className="msger-input"
//           placeholder='Напишите, например: "молоко 2.5% 1 л Простоквашино"'
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           aria-label="Message"
//         />
//         <button
//           type="submit"
//           className="msger-send-btn"
//           style={sendBtnStyle}
//           title="Отправить (Send)"
//         >
//           Отправить
//         </button>
//       </form>
//     </section>
//   );
// }

import React, { useEffect, useRef, useState } from "react";
import "./chat.css";
import TimeZone from "../TimeZone/TimeZone.jsx";

const BOT_IMG = "./bot.svg";
const PERSON_IMG = "./user.svg";
const BOT_NAME = "БOT";
const PERSON_NAME = "Пользователь";

const escapeHtml = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );

const pad2 = (n) => String(n).padStart(2, "0");
const nowHHMM = () => {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
const uid = () => Math.random().toString(36).slice(2);

export default function MessengerChat({
  headerTitle = "Ваш персональный помощник",
  logoSrc = "/logo.svg",
  mock = false,
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => [
    {
      id: uid(),
      side: "left",
      name: BOT_NAME,
      img: BOT_IMG,
      time: nowHHMM(),
      text:
        "Здравствуйте! Я помогу Вам выбрать необходимые продукты.\n" +
        "Напишите, например: «молоко 2.5% 1 л Простоквашино».",
    },
  ]);

  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages.length]);

  const appendMessage = (name, img, side, text, { dedupeBot = true } = {}) => {
    if (dedupeBot && side === "left") {
      const lastBot = [...messages].reverse().find((m) => m.side === "left");
      if (lastBot && lastBot.text.trim() === String(text).trim()) return;
    }
    setMessages((prev) => [
      ...prev,
      { id: uid(), side, name, img, time: nowHHMM(), text },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msgText = input.trim();
    if (!msgText) return;

    appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText, {
      dedupeBot: false,
    });
    setInput("");

    if (mock) {
      appendMessage(BOT_NAME, BOT_IMG, "left", "Мок-режим: mock=true");
      return;
    }

    try {
      // без истории — всегда независимый запрос
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msgText, history: [] }),
      });

      const code = res.status;
      const ct = (res.headers.get("content-type") || "").toLowerCase();
      const raw = await res.text();

      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }

      if (!res.ok) {
        appendMessage(
          BOT_NAME,
          BOT_IMG,
          "left",
          `Ошибка сервера: ${code}\nContent-Type: ${ct}\n${raw.slice(0, 200)}`
        );
        return;
      }

      // ---- УПРОЩЁННЫЙ ВЫВОД: ТОЛЬКО КАРТИНКА + ОДНА СТРОКА ----
      const resp = data?.response || data || {};
      const imgHtml = resp.image
        ? `<img src="${resp.image}" alt="product" style="max-width:120px;border-radius:6px;display:block;margin-bottom:6px;" />`
        : "";

      // берём первую строку из decrypted_data; если её нет — используем category
      const line =
        Array.isArray(resp.decrypted_data) && resp.decrypted_data.length > 0
          ? String(resp.decrypted_data[0])
          : resp.category
          ? String(resp.category)
          : "";

      const safeLine = escapeHtml(line);

      // показываем только один ответ бота (картинка + строка, если есть хотя бы что-то)
      if (imgHtml || safeLine) {
        appendMessage(
          BOT_NAME,
          BOT_IMG,
          "left",
          `${imgHtml}${safeLine ? `<div>${safeLine}</div>` : ""}`,
          { dedupeBot: false }
        );
        return; // важнo: прекращаем дальнейшую обработку
      }

      // если пришло что-то неожиданное — отдадим часть сырого ответа
      appendMessage(BOT_NAME, BOT_IMG, "left", raw.slice(0, 400));
    } catch (err) {
      console.error("fetch error:", err);
      appendMessage(BOT_NAME, BOT_IMG, "left", "Ошибка соединения с сервером");
    }
  };

  const sendBtnStyle = { backgroundColor: "#4CAF50" };

  return (
    <section className="msger" aria-label="Chat">
      <header className="msger-header">
        <div className="msger-header-title">
          <i className="fas fa-comment-alt" aria-hidden="true"></i>
          <img src={logoSrc} alt="logo" />
          {headerTitle}
        </div>
        <div className="msger-header-options">
          <span>
            <i className="fas fa-cog" aria-hidden="true"></i>
          </span>
        </div>
      </header>

      <main className="msger-chat" ref={chatRef} aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} className={`msg ${m.side}-msg`}>
            <div
              className="msg-img"
              style={{ backgroundImage: `url(${m.img})` }}
            />
            <div className="msg-bubble">
              <div className="msg-info">
                <div className="msg-info-name">{m.name}</div>
                <div className="msg-info-time">
                  <span>{m.time}</span>
                  <TimeZone compact />
                </div>
              </div>
              <div
                className="msg-text"
                style={{ whiteSpace: "pre-wrap" }}
                dangerouslySetInnerHTML={{ __html: m.text }}
              />
            </div>
          </div>
        ))}
      </main>

      <form className="msger-inputarea" onSubmit={handleSubmit}>
        <input
          type="text"
          className="msger-input"
          placeholder='Напишите, например: "молоко 2.5% 1 л Простоквашино"'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Message"
        />
        <button
          type="submit"
          className="msger-send-btn"
          style={sendBtnStyle}
          title="Отправить (Send)"
        >
          Отправить
        </button>
      </form>
    </section>
  );
}
