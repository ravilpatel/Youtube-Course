const API_KEY = 'AIzaSyC_fLjQBL-Ib1N61PlIUBTlAxi_0WwUuYM'; 

let videos = [];
let currentIndex = 0;
let nextPageToken = null;
let playlistId = null;

function getPlaylistId(url) {
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function loadPlaylist() {
  const url = document.getElementById('playlistUrl').value;
  playlistId = getPlaylistId(url);
  if (!playlistId) return alert("Invalid playlist URL!");

  localStorage.setItem('savedPlaylistURL', url);
  videos = [];
  currentIndex = 0;
  localStorage.setItem('currentIndex', 0);

  fetchVideos();
}

function fetchVideos(pageToken = '') {
  const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}${pageToken ? `&pageToken=${pageToken}` : ''}`;

  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      nextPageToken = data.nextPageToken || null;
      videos = [...videos, ...data.items];
      updateSidebar();
      showVideo(currentIndex);
      document.getElementById('loadMoreBtn').style.display = nextPageToken ? 'block' : 'none';
    });
}

function loadMore() {
  if (nextPageToken) fetchVideos(nextPageToken);
}



function showVideo(index) {
  if (index >= videos.length) return;

  const video = videos[index];
  const videoId = video.snippet.resourceId.videoId;
  const title = video.snippet.title;
  const isCompleted = localStorage.getItem(videoId) === 'true';

  const container = document.getElementById('courseContainer');
  container.innerHTML = `
    <div class="videoCard ${isCompleted ? 'completed' : ''}">
      <h3>${index + 1}. ${title}</h3>
      <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" rel="0" allowfullscreen></iframe><br/>
      <button class="markComplete" onclick="toggleCompleted('${videoId}')">
        ${isCompleted ? 'Mark as Unread ❌' : 'Mark as Completed ✅'}
      </button>
      <button class="prevVideo" onclick="prevVideo()">⬅ Previous</button>
      <button class="nextVideo" onclick="nextVideo()">Next ➡</button>
    </div>
  `;

  updateProgressBar();
}

function updateSidebar() {
  const list = document.getElementById('videoList');
  list.innerHTML = '';
  videos.forEach((v, i) => {
    const li = document.createElement('li');
    const vidId = v.snippet.resourceId.videoId;
    const isCompleted = localStorage.getItem(vidId) === 'true';
    li.className = isCompleted ? 'completed' : '';
    li.innerHTML = `<i class="fas ${isCompleted ? 'fa-check-circle' : 'fa-circle'}"></i> ${i + 1}. ${v.snippet.title.slice(0, 40)}`;
    li.onclick = () => {
      currentIndex = i;
      localStorage.setItem('currentIndex', i);
      showVideo(i);
    };
    list.appendChild(li);
  });
  updateProgressBar();
}

function toggleCompleted(videoId) {
  const currentStatus = localStorage.getItem(videoId) === 'true';
  localStorage.setItem(videoId, !currentStatus);
  showVideo(currentIndex);
  updateSidebar();
}

function nextVideo() {
  if (currentIndex < videos.length - 1) {
    currentIndex++;
    localStorage.setItem('currentIndex', currentIndex);
    showVideo(currentIndex);
  }
}

function prevVideo() {
  if (currentIndex > 0) {
    currentIndex--;
    localStorage.setItem('currentIndex', currentIndex);
    showVideo(currentIndex);
  }
}

function clearPlaylist() {
  localStorage.clear();
  location.reload();
}

function updateProgressBar() {
  let completed = 0;
  videos.forEach(v => {
    if (localStorage.getItem(v.snippet.resourceId.videoId) === 'true') completed++;
  });
  const percentage = videos.length ? Math.floor((completed / videos.length) * 100) : 0;
  document.getElementById('sidebarProgressBar').style.width = `${percentage}%`;
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  const icon = document.getElementById('themeToggle').querySelector('i');
  icon.className = document.body.classList.contains('dark') ? 'fas fa-sun' : 'fas fa-moon';
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

window.onload = () => {
  const savedUrl = localStorage.getItem('savedPlaylistURL');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') document.body.classList.add('dark');
  document.getElementById('themeToggle').innerHTML = savedTheme === 'dark'
    ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

  if (savedUrl) {
    document.getElementById('playlistUrl').value = savedUrl;
    loadPlaylist();
  }
};
