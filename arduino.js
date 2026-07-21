let port;
let reader;
let writer;

let buffer = "";

let students =
JSON.parse(localStorage.getItem("students")) || [];


let currentUID = "";



// ===============================
// CONNECT ARDUINO
// ===============================

async function connectArduino(){

try{


port = await navigator.serial.requestPort();


await port.open({
baudRate:9600
});


writer =
port.writable.getWriter();



const connection = document.getElementById("connection");

connection.innerHTML = `
    <i data-lucide="badge-check"></i>
    Arduino Connected
`;

connection.style.color = "#22c55e"; // Green text
connection.style.background = "#dcfce7"; // Light green background
connection.style.border = "1px solid #86efac";

lucide.createIcons();


showMessage(
"Arduino connected successfully"
);



readArduino();



}

catch(error){

console.log(error);

showMessage(
"Arduino connection failed"
);

}

}





// ===============================
// READ SERIAL DATA
// ===============================

async function readArduino(){


const decoder =
new TextDecoderStream();


port.readable.pipeTo(
decoder.writable
);



reader =
decoder.readable.getReader();



while(true){


let {value,done}
=
await reader.read();



if(done)
break;



buffer += value;



let lines =
buffer.split("\n");



buffer =
lines.pop();



lines.forEach(line=>{


line=line.trim();


if(line){

console.log(
"Arduino:",
line
);


processRFID(line);


}


});


}


}





// ===============================
// SEND COMMAND
// ===============================

async function sendCommand(command){


if(!writer){

showMessage(
"Connect Arduino first"
);

return;

}



await writer.write(

new TextEncoder().encode(
command+"\n"
)

);


console.log(
"Sent:",
command
);


}





// ===============================
// REGISTER RFID
// ===============================


function scanRFID(){


sendCommand(
"REGISTER"
);


showMessage(
"Scan RFID card now"
);


}





// ===============================
// RECEIVE RFID
// ===============================


function processRFID(data){



// REGISTER MODE

if(data.startsWith("REGISTER:")){


currentUID =
data
.replace("REGISTER:","")
.trim()
.toUpperCase();



document.getElementById("uid").innerHTML =
currentUID;



showMessage(
"RFID captured: "+currentUID
);



}





// ATTENDANCE MODE


if(data.startsWith("CARD:")){


let uid =
data
.replace("CARD:","")
.trim()
.toUpperCase();



let student =
students.find(
s=>s.rfid===uid
);



if(student){


student.present=true;

student.status="Present";



localStorage.setItem(
"students",
JSON.stringify(students)
);



showMessage(`
  <i data-lucide="circle-check"></i>
  Attendance marked: ${student.name}
`);

lucide.createIcons();


}


else{


showMessage(
"RFID not registered"
);


}


}


}





// ===============================
// SAVE STUDENT
// ===============================


function saveStudent(){


let name =
document.getElementById("name").value.trim();



if(!name){

showMessage(
"Enter student name"
);

return;

}



if(!currentUID){


showMessage(
"Scan RFID first"
);


return;


}




students.push({

name:name,

rfid:currentUID,

present:false,

status:"Absent"


});



localStorage.setItem(
"students",
JSON.stringify(students)
);



document.getElementById("name").value="";


document.getElementById("uid").innerHTML =
"Waiting...";


currentUID="";



showMessage(
"Student saved"
);



}





// ===============================
// START ATTENDANCE
// ===============================


function startAttendance(){


students.forEach(s=>{


s.present=false;

s.status="Absent";


});



localStorage.setItem(
"students",
JSON.stringify(students)
);



sendCommand(
"START"
);



showMessage(
"Attendance started"
);



}






// ===============================
// STOP ATTENDANCE
// ===============================


function stopAttendance(){


sendCommand(
"STOP"
);



students.forEach(s=>{


if(s.present){

s.status="Present";

}

else{

s.status="Absent";

}


});



localStorage.setItem(
"students",
JSON.stringify(students)
);



showMessage(
"Attendance stopped"
);



}







// ===============================
// RESET
// ===============================


function resetAttendance(){


let ok =
confirm(
"Reset all attendance?"
);



if(!ok)
return;



students.forEach(s=>{


s.present=false;

s.status="Absent";


});



localStorage.setItem(
"students",
JSON.stringify(students)
);



showMessage(
"Attendance reset"
);



}





// ===============================
// EDIT STUDENT
// ===============================


function editStudent(index){



let student =
students[index];



let name =
prompt(
"Edit name:",
student.name
);



if(name){


student.name=name.trim();



localStorage.setItem(
"students",
JSON.stringify(students)
);



showMessage(
"Student updated"
);



}



}





// ===============================
// DELETE STUDENT
// ===============================


function deleteStudent(index){



let student =
students[index];



let ok =
confirm(
"Delete "+student.name+"?"
);



if(ok){


students.splice(index,1);



localStorage.setItem(
"students",
JSON.stringify(students)
);



showMessage(
"Student deleted"
);



}



}





// ===============================
// EXPORT EXCEL
// ===============================


function downloadExcel(){


let data =
students.map(s=>({

Name:s.name,

RFID:s.rfid,

Status:s.status || "Absent"


}));



let sheet =
XLSX.utils.json_to_sheet(data);



let book =
XLSX.utils.book_new();



XLSX.utils.book_append_sheet(
book,
sheet,
"Attendance"
);



XLSX.writeFile(
book,
"Plate2Purpose_Attendance.xlsx"
);



showMessage(
"Excel exported"
);



}
