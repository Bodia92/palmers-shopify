document.addEventListener('DOMContentLoaded', function () {
  const accordion = (
    activeStateName = 'accordion__item--active_state',
    triggerSelector = '.js-acc-trigger',
    closeAllItem = true
  ) => {
    const $triggers = document.querySelectorAll(triggerSelector)

    let enabled = true

    const isEnabled = () => enabled

    const closeAccordion = ($parentEl, $nextElementSibling) => {
      $parentEl.classList.remove(activeStateName)
      $nextElementSibling.style.maxHeight = null // eslint-disable-line no-param-reassign
    }

    const closeAllAccordion = () => {
      $triggers.forEach(($item) => {
        closeAccordion($item.parentNode, $item.nextElementSibling)
      })
    }

    const openAccordion = ($parentEl, $nextElementSibling) => {
      setTimeout(() => {
        if (closeAllItem) {
          closeAllAccordion()
        }

        $parentEl.classList.add(activeStateName)
        // eslint-disable-next-line no-param-reassign
        $nextElementSibling.style.maxHeight =
          $nextElementSibling.scrollHeight + 'px' // eslint-disable-line
      }, 100)
    }

    const toggleActiveState = ($trigger) => {
      if (enabled) {
        const $parentEl = $trigger.parentNode
        const $nextElementSibling = $trigger.nextElementSibling
        if ($parentEl.classList.contains(activeStateName)) {
          closeAccordion($parentEl, $nextElementSibling)
        } else {
          openAccordion($parentEl, $nextElementSibling)
        }
      }
    }

    const onResize = () => {
      if (isEnabled()) {
        $triggers.forEach(($item) => {
          const $parentEl = $item.parentNode

          if ($parentEl.classList.contains(activeStateName)) {
            const $nextElementSibling = $item.nextElementSibling
            $nextElementSibling.style.maxHeight =
              $nextElementSibling.scrollHeight + 'px' // eslint-disable-line prefer-template
          }
        })
      }
    }

    // onWindowResize(onResize)
    $triggers.forEach(($item) => {
      const $parentEl = $item.parentNode

      if ($parentEl.classList.contains(activeStateName) && isEnabled()) {
        const $nextElementSibling = $item.nextElementSibling

        openAccordion($parentEl, $nextElementSibling)
      }

      $item.addEventListener('click', () => {
        toggleActiveState($item)
      })
    })
  }

  accordion('accordion__item--active_state')
})
