document.addEventListener('DOMContentLoaded', function () {
  const $messageLinks = document.querySelectorAll('.form__input-message')

  $messageLinks.forEach((messageLink) => {
    messageLink.addEventListener('click', () => {
      const messagePopup = messageLink.querySelector('.form__input-message_box')

      messagePopup.classList.toggle('message_box--active_state')
    })
  })
})
