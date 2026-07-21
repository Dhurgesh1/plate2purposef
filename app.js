import client from "./credentials.js";

async function loadUsers() {
  document.getElementById("status").innerText = "Loading...";
  const { data, error } = await client.from("users").select("*");

  if (error) {
    document.getElementById("status").innerText = "Error loading users!";
    console.error(error);
    return;
  }

  document.getElementById("status").innerText = "Loaded!";
  console.log(data);
}

loadUsers();
