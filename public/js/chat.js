
const socket = io();
// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
//Templates
const chatMessages = document.querySelector(".chat-messages");
const $messageTemplate = document.querySelector('#message-template').innerHTML;
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML
let userId
//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

socket.on("message", (message) => {
  console.log(message.isCurrentUser)
   const isCurrentUser = userId===message.id && message.username!=='Server'             
  const chatAlignmentClass = isCurrentUser && message.username!=='Server' ? 'chat-end' : 'chat-start'; 

    const html = Mustache.render($messageTemplate, {
        isLocation: false,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A'),
        username: message.username,
        chatAlignmentClass: chatAlignmentClass,
        isCurrentUser: isCurrentUser
      });
    chatMessages.insertAdjacentHTML('beforeend', html);
    autoScroll()

});

socket.on('locationMessage', (location) => {
  console.log(location.isCurrentUser)
  const isCurrentUser = userId===location.id                     
  const chatAlignmentClass = isCurrentUser  ? 'chat-end' : 'chat-start'; 

    const html = Mustache.render($messageTemplate, {
        isLocation: true,
        locationUrl: `https://www.google.com/maps?q=${location.url.latitude},${location.url.longitude}`,
        createdAt: moment(location.createdAt).format('h:mm A'),
        username: location.username,
        chatAlignmentClass:chatAlignmentClass,
        isCurrentUser: isCurrentUser
    });
    chatMessages.insertAdjacentHTML('beforeend', html);
    autoScroll()
});

// Enable or disable send button based on input field content
$messageFormInput.addEventListener('input', () => {
    if ($messageFormInput.value.trim() === '') {
        $messageFormButton.setAttribute('disabled', 'disabled');
    } else {
        $messageFormButton.removeAttribute('disabled');
    }
});

document.querySelector("#message-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const message = e.target.elements.message.value.trim(); // Get and trim the message

  // Check if the message is empty
  if (message === '') {
      return; // Don't send empty messages
  }

  $messageFormButton.setAttribute('disabled', 'disabled'); // Disable button after form submit

  socket.emit('sendMessage', message, (error) => {
      $messageFormButton.removeAttribute('disabled');
      $messageFormInput.value = ''; // Clear input field after sending message
      $messageFormInput.focus(); // Refocus the input field

      if (error) {
          return console.log(error);
      }

      console.log('The message was delivered!');
  });
});


document.getElementById('sendLocation').addEventListener('click', () => {
    const sendIcon = document.getElementById('sendIcon');
    const loadingIcon = document.getElementById('loading');
    const sendLocationButton = document.getElementById('sendLocation');

    sendIcon.classList.add('hidden');
    loadingIcon.classList.remove('hidden');
    sendLocationButton.setAttribute('disabled', 'disabled');

    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        resetButton();
        return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const location = {
            latitude,
            longitude
        };
        socket.emit('sendLocation', location, () => {
            console.log('Location shared');
            resetButton();
        });
    });
});

function resetButton() {
    const sendIcon = document.getElementById('sendIcon');
    const loadingIcon = document.getElementById('loading');
    const sendLocationButton = document.getElementById('sendLocation');

    sendIcon.classList.remove('hidden');
    loadingIcon.classList.add('hidden');
    sendLocationButton.removeAttribute('disabled');
}

socket.emit('join', { username, room } , (error , id)=>{
  if(error){

    return alertify
    .alert(error, function(){
      alertify.message('OK');
      location.href='/'
    });    
  }
  userId=id

});


socket.on('roomData' , ({room ,users})=>{
 const html = Mustache.render(sideBarTemplate , {
  room, 
  users
 })
 document.querySelector('#sidebar').innerHTML = html


})

  document.getElementById("logoutBtn").addEventListener("click", function() {
    location.href = '/'
  });


  function autoScroll() {
    // Get the new message element (last message in chat)
    const newMessage = chatMessages.lastElementChild;

    // Get the height of the new message
    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    // Get the visible height of the chat container
    const visibleHeight = chatMessages.offsetHeight;

    // Get the height of the chat container's content (scrollable height)
    const containerHeight = chatMessages.scrollHeight;

    // How far has the user scrolled?
    const scrollOffset = chatMessages.scrollTop + visibleHeight;

    // Check if the user was near the bottom before the new message was added
    if (containerHeight - newMessageHeight <= scrollOffset) {
        // Scroll to the bottom if they were near the bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}
