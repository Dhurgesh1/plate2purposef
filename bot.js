// ======================
// CONFIG
// ======================

const API_KEY = "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";

const SYSTEM_PROMPT = `
You are Plate2Purpose AI.

Plate2Purpose is a school food wastage reduction platform.

Your job:
- Help users use Plate2Purpose.
- Help users troubleshoot bugs.
- Explain dashboard features.
- Explain attendance tracking.
- Explain food calculations.
- Explain reports.
- Explain SDG 12.
- Explain Plate2Purpose features.

Rules:
- Keep answers short.
- Do not introduce yourself repeatedly.
- Do not use headings unless necessary.
- Do not use hashtags.
- Do not use excessive emojis.
- Do not give long lists unless requested.
- Speak naturally like a support agent.
- If the user says "hi", simply greet them.
- If the user asks "who are you", answer in 1-2 sentences.
- If the user reports a bug, ask what page they were on and what happened.
- Never act like a recipe website.
- Never ask what food is in their kitchen.
- Never make up features that do not exist.

About Plate2Purpose:
Plate2Purpose helps schools reduce food waste by tracking attendance, meal preferences, food requirements, and feedback while supporting SDG 12.
`;

// ======================
// STORAGE
// ======================

let chats =
JSON.parse(
localStorage.getItem(
"platebot_chats"
) || "[]"
);

let currentChat = null;

const messages =
document.getElementById(
"messages"
);

// ======================
// SAVE
// ======================

function saveChats(){

localStorage.setItem(
"platebot_chats",
JSON.stringify(chats)
);

}

// ======================
// CHAT LIST
// ======================

function renderChats(){

const list =
document.getElementById(
"chatList"
);

const search =
document.getElementById(
"chatSearch"
)?.value
.toLowerCase() || "";

list.innerHTML = "";

chats.forEach(chat=>{

if(
!chat.title
.toLowerCase()
.includes(search)
){
return;
}

const div =
document.createElement(
"div"
);

div.className =
"chat-item";

if(
currentChat &&
currentChat.id === chat.id
){
div.classList.add(
"active-chat"
);
}

div.innerHTML = `
<div class="chat-content">

<span
class="chat-title"
onclick="openChat(${chat.id})">

<i class="bi bi-chat-left-text"></i>
${chat.title}

</span>

<button
class="delete-chat-btn"
onclick="deleteChat(${chat.id},event)">

<i class="bi bi-trash"></i>

</button>

</div>
`;

list.appendChild(div);

});

}

// ======================
// NEW CHAT
// ======================

function newChat(){

currentChat = {

id: Date.now(),

title: "New Chat",

messages:[

{
role:"bot",
content:
"Welcome to Plate2Purpose Support. Ask me about attendance, reports, food calculations, SDG 12, or platform issues."
}

]

};

chats.unshift(
currentChat
);

saveChats();

renderChats();

openChat(
currentChat.id
);

}

// ======================
// OPEN CHAT
// ======================

function openChat(id){

currentChat =
chats.find(
c=>c.id===id
);

if(!currentChat)
return;

messages.innerHTML = "";

currentChat.messages.forEach(msg=>{

messages.appendChild(

createMessage(
msg.role,
msg.content
)

);

});

renderChats();

scrollBottom();

}

// ======================
// DELETE CHAT
// ======================

function deleteChat(
id,
event
){

event.stopPropagation();

if(
!confirm(
"Delete this chat?"
)
){
return;
}

chats =
chats.filter(
c=>c.id!==id
);

saveChats();

renderChats();

if(
currentChat &&
currentChat.id===id
){

if(chats.length){

openChat(
chats[0].id
);

}else{

newChat();

}

}

}

// ======================
// CLEAR CURRENT CHAT
// ======================

function clearCurrentChat(){

if(
!currentChat
)return;

currentChat.messages = [

{
role:"bot",
content:
"Welcome to Plate2Purpose Support."
}

];

saveChats();

openChat(
currentChat.id
);

}

// ======================
// MESSAGE ELEMENT
// ======================

function createMessage(
role,
text
){

const div =
document.createElement(
"div"
);

div.className =
`message ${
role==="user"
? "user"
: "bot"
}`;

div.innerHTML =
text.replace(
/\n/g,
"<br>"
);

return div;

}

// ======================
// SCROLL
// ======================

function scrollBottom(){

messages.scrollTop =
messages.scrollHeight;

}

// ======================
// TYPING
// ======================

function showTyping(){

const div =
document.createElement(
"div"
);

div.className =
"message bot";

div.id =
"typing";

div.innerHTML =
`
<div class="typing">
<span></span>
<span></span>
<span></span>
</div>
`;

messages.appendChild(
div
);

scrollBottom();

}

function removeTyping(){

const typing =
document.getElementById(
"typing"
);

if(typing)
typing.remove();

}

// ======================
// SEND
// ======================

async function sendMessage(){

const input =
document.getElementById(
"prompt"
);

const text =
input.value.trim();

if(!text)
return;

if(!currentChat)
newChat();

if(
currentChat.title ===
"New Chat"
){

currentChat.title =
text.substring(
0,
30
);

}

currentChat.messages.push({

role:"user",
content:text

});

saveChats();

renderChats();

openChat(
currentChat.id
);

input.value="";

showTyping();

try{

const history = [];

currentChat.messages.forEach(msg=>{

history.push({

role:
msg.role==="bot"
? "assistant"
: "user",

content:
msg.content

});

});

const response =
await fetch(
"https://openrouter.ai/api/v1/chat/completions",
{
method:"POST",

headers:{

"Authorization":
`Bearer ${API_KEY}`,

"Content-Type":
"application/json"

},

body:JSON.stringify({

model:
"deepseek/deepseek-chat",

temperature:0.3,

messages:[

{
role:"system",
content:
SYSTEM_PROMPT
},

...history

]

})

}
);

const data =
await response.json();

removeTyping();

const reply =
data.choices?.[0]
?.message?.content
||
"Sorry, I couldn't generate a response.";

currentChat.messages.push({

role:"bot",
content:reply

});

saveChats();

openChat(
currentChat.id
);

}catch(err){

console.error(err);

removeTyping();

currentChat.messages.push({

role:"bot",
content:
"Connection error. Please try again."
});

saveChats();

openChat(
currentChat.id
);

}

}

// ======================
// ENTER TO SEND
// ======================

document
.getElementById(
"prompt"
)
.addEventListener(
"keydown",
e=>{

if(
e.key==="Enter"
&& !e.shiftKey
){

e.preventDefault();

sendMessage();

}

}
);

// ======================
// SEARCH
// ======================

document
.getElementById(
"chatSearch"
)
.addEventListener(
"input",
renderChats
);

// ======================
// SIDEBAR TOGGLE
// ======================

const sidebar =
document.getElementById(
"sidebar"
);

const toggleSidebar =
document.getElementById(
"toggleSidebar"
);

if(
localStorage.getItem(
"sidebarHidden"
)==="true"
){

sidebar.classList.add(
"hidden"
);

}

toggleSidebar
.addEventListener(
"click",
()=>{

sidebar.classList.toggle(
"hidden"
);

localStorage.setItem(
"sidebarHidden",
sidebar.classList.contains(
"hidden"
)
);

}
);

// ======================
// STARTUP
// ======================

renderChats();

if(
chats.length
){

openChat(
chats[0].id
);

}else{

newChat();

}
