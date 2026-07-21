// ======================
// CONFIG
// ======================

console.log("Bot.js loaded");

const BACKEND_CHAT_URL =
"https://pljmachiuahkrkiddehc.supabase.co/functions/v1/platebot-chat";

// ======================
// STORAGE
// ======================

function loadChats(){
  try{
    const savedChats = localStorage.getItem("platebot_chats");
    return savedChats ? JSON.parse(savedChats) : [];
  }catch(err){
    console.warn(
      "Unable to load saved chats from localStorage, resetting history.",
      err
    );
    localStorage.removeItem("platebot_chats");
    return [];
  }
}

let chats = loadChats();
let currentChat = null;
let isAwaitingResponse = false;

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

    currentChat = chats.find(c => c.id === id);

    if (!currentChat) return;

    messages.innerHTML = "";

    currentChat.messages.forEach(msg => {

        const role =
            typeof msg.role === "string"
                ? msg.role
                : "bot";

        let content = msg.content;

        // Recover old/broken chat formats
        if (typeof content !== "string") {

            if (content?.message)
                content = content.message;

            else if (content?.content)
                content = content.content;

            else if (content?.error)
                content = content.error;

            else if (content == null)
                content = "";

            else
                content = JSON.stringify(content, null, 2);
        }

        messages.appendChild(
            createMessage(role, content)
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

function createMessage(role, text){

    const div = document.createElement("div");

    div.className =
    `message ${role === "user" ? "user" : "bot"}`;


    // Safety conversion
    if(text == null){
        text = "";
    }

    if(typeof text !== "string"){
        text = JSON.stringify(text,null,2);
    }


    let formatted = text;


    // Escape HTML first
    formatted = formatted
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;");


    // Code blocks ``` ```
    formatted = formatted.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    `
    <pre><code>$2</code></pre>
    `
    );


    // Inline code
    formatted = formatted.replace(
    /`([^`]+)`/g,
    "<code>$1</code>"
    );


    // Links
    formatted = formatted.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
    '<a href="$2" target="_blank">$1</a>'
    );


    // Bare URLs
    formatted = formatted.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank">$1</a>'
    );


    // Headers
    formatted = formatted.replace(
    /^### (.*)$/gm,
    "<h3>$1</h3>"
    );

    formatted = formatted.replace(
    /^## (.*)$/gm,
    "<h2>$1</h2>"
    );

    formatted = formatted.replace(
    /^# (.*)$/gm,
    "<h1>$1</h1>"
    );


    // Bold + italic
    formatted = formatted.replace(
    /\*\*\*(.*?)\*\*\*/g,
    "<strong><em>$1</em></strong>"
    );


    // Bold
    formatted = formatted.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
    );


    // Italic
    formatted = formatted.replace(
    /\*(.*?)\*/g,
    "<em>$1</em>"
    );


    // Strikethrough
    formatted = formatted.replace(
    /~~(.*?)~~/g,
    "<del>$1</del>"
    );


    // Blockquotes
    formatted = formatted.replace(
    /^> (.*)$/gm,
    "<blockquote>$1</blockquote>"
    );


    // Tables
    formatted = formatted.replace(
    /((?:\|.*\|\n?)+)/g,
    function(table){

        let rows = table
        .trim()
        .split("\n");


        let html =
        "<table class='ai-table'>";


        rows.forEach((row,index)=>{

            if(row.includes("---"))
                return;


            let cells =
            row
            .split("|")
            .filter(x=>x.trim());


            html += "<tr>";


            cells.forEach(cell=>{

                html += index===0
                ? `<th>${cell.trim()}</th>`
                : `<td>${cell.trim()}</td>`;

            });


            html += "</tr>";

        });


        html += "</table>";

        return html;

    });



    // Ordered lists
    formatted = formatted.replace(
    /^(\d+)\. (.*)$/gm,
    "<li>$2</li>"
    );


    // Bullet lists
    formatted = formatted.replace(
    /^[-*] (.*)$/gm,
    "<li>$1</li>"
    );


    // Wrap consecutive li
    formatted = formatted.replace(
    /(<li>.*<\/li>)/gs,
    "<ul>$1</ul>"
    );


    // Horizontal line
    formatted = formatted.replace(
    /^---$/gm,
    "<hr>"
    );


    // New lines
    formatted = formatted.replace(
    /\n/g,
    "<br>"
    );


    div.innerHTML = formatted;


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

if(!text || isAwaitingResponse)
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
).trim() || "New Chat";

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

isAwaitingResponse = true;

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
BACKEND_CHAT_URL,
{
method:"POST",
headers:{
"Content-Type":
"application/json"
},
body:JSON.stringify({
messages:history
})
}
);

const data =
await response.json();

removeTyping();

if(!response.ok){
console.error("Chat backend error:", data);

currentChat.messages.push({
role:"bot",
content:
data.error || "Unable to connect to chat service. Please try again."
});

saveChats();
openChat(
currentChat.id
);
return;
}

const reply =
 data.reply ||
 data.choices?.[0]
?.message?.content ||
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

}finally{
  isAwaitingResponse = false;
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
