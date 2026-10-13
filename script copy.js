// Data nama awal anggota. Ubah nilai name jika ingin mengganti nama.
const initialMembers = [
  { name: "Nama Anggota 1", photo: "" },
  { name: "Nama Anggota 2", photo: "" },
  { name: "Nama Anggota 3", photo: "" },
  { name: "Nama Anggota 4", photo: "" },
  { name: "Nama Anggota 5", photo: "" },
  { name: "Nama Anggota 6", photo: "" },
  { name: "Nama Anggota 7", photo: "" }
];

const grid = document.getElementById("memberGrid");
const photoInput = document.getElementById("photoInput");
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");
let selectedMemberIndex = null;
let members = loadMembers();

function loadMembers() {
  try {
    const saved = localStorage.getItem("cerdasBermediaMembers");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 7) return parsed;
    }
  } catch (error) {
    console.warn("Data anggota tersimpan tidak dapat dibaca.", error);
  }
  return initialMembers.map(member => ({ ...member }));
}

function saveMembers() {
  try {
    localStorage.setItem("cerdasBermediaMembers", JSON.stringify(members));
  } catch (error) {
    alert("Perubahan belum dapat disimpan di browser ini. Jika foto terlalu besar, coba gunakan foto dengan ukuran file lebih kecil.");
  }
}

function renderMembers() {
  grid.innerHTML = "";
  members.forEach((member, index) => {
    const card = document.createElement("article");
    card.className = "member-card";

    const wrap = document.createElement("div");
    wrap.className = "member-photo-wrap";

    if (member.photo) {
      const img = document.createElement("img");
      img.className = "member-photo";
      img.alt = "Foto " + member.name;
      img.src = member.photo;
      wrap.appendChild(img);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "photo-placeholder";
      placeholder.innerHTML = '<span class="avatar-icon" aria-hidden="true">♙</span><small>Foto anggota ' + (index + 1) + '</small>';
      wrap.appendChild(placeholder);
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "photo-input-button";
    button.textContent = member.photo ? "Ganti Foto" : "＋ Pilih Foto";
    button.addEventListener("click", () => {
      selectedMemberIndex = index;
      photoInput.click();
    });

    const name = document.createElement("input");
    name.className = "member-name";
    name.type = "text";
    name.value = member.name;
    name.maxLength = 70;
    name.setAttribute("aria-label", "Nama anggota " + (index + 1));
    name.addEventListener("change", () => {
      members[index].name = name.value.trim() || "Nama Anggota " + (index + 1);
      saveMembers();
      renderMembers();
    });

    const number = document.createElement("span");
    number.className = "member-number";
    number.textContent = "ANGGOTA " + String(index + 1).padStart(2, "0");

    card.append(wrap, button, name, number);
    grid.appendChild(card);
  });
}

photoInput.addEventListener("change", event => {
  const file = event.target.files && event.target.files[0];
  if (!file || selectedMemberIndex === null) return;
  if (!file.type.startsWith("image/")) {
    alert("Pilih file gambar, misalnya JPG, PNG, atau WebP.");
    photoInput.value = "";
    return;
  }
  // Resize images before saving so browser storage is less likely to fill up.
  const reader = new FileReader();
  reader.onload = () => {
    const source = new Image();
    source.onload = () => {
      const maxSide = 900;
      const scale = Math.min(1, maxSide / Math.max(source.width, source.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(source.width * scale));
      canvas.height = Math.max(1, Math.round(source.height * scale));
      const context = canvas.getContext("2d");
      context.drawImage(source, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL("image/jpeg", 0.82);
      members[selectedMemberIndex].photo = compressed;
      saveMembers();
      renderMembers();
      selectedMemberIndex = null;
      photoInput.value = "";
    };
    source.onerror = () => alert("Foto tidak dapat dibuka. Coba pilih file gambar lain.");
    source.src = reader.result;
  };
  reader.onerror = () => alert("File foto tidak dapat dibaca.");
  reader.readAsDataURL(file);
});

menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "×" : "☰";
});
nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
    nav.querySelectorAll("a").forEach(item => item.classList.remove("active"));
    link.classList.add("active");
  });
});

renderMembers();
