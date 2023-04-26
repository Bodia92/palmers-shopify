/**
 * Include your custom JavaScript here.
 *
 * We also offer some hooks so you can plug your own logic. For instance, if you want to be notified when the variant
 * changes on product page, you can attach a listener to the document:
 *
 * document.addEventListener('variant:changed', function(event) {
 *   var variant = event.detail.variant; // Gives you access to the whole variant details
 * });
 *
 * You can also add a listener whenever a product is added to the cart:
 *
 * document.addEventListener('product:added', function(event) {
 *   var variant = event.detail.variant; // Get the variant that was added
 *   var quantity = event.detail.quantity; // Get the quantity that was added
 * });
 *
 * If you are an app developer and requires the theme to re-render the mini-cart, you can trigger your own event. If
 * you are adding a product, you need to trigger the "product:added" event, and make sure that you pass the quantity
 * that was added so the theme can properly update the quantity:
 *
 * document.documentElement.dispatchEvent(new CustomEvent('product:added', {
 *   bubbles: true,
 *   detail: {
 *     quantity: 1
 *   }
 * }));
 *
 * If you just want to force refresh the mini-cart without adding a specific product, you can trigger the event
 * "cart:refresh" in a similar way (in that case, passing the quantity is not necessary):
 *
 * document.documentElement.dispatchEvent(new CustomEvent('cart:refresh', {
 *   bubbles: true
 * }));
 */
document.addEventListener('DOMContentLoaded', function () {
  function runPostcodeCheck() {
    $.ajax({
      method: 'GET',
      url: 'https://shop-api.palmers.co.nz/?pc=' + $('#select-postcode').val(),
      success: function (data) {
        if (data != -1) {
          document.dispatchEvent(new CustomEvent('modal:close'))
          $('#select-postcode').prop('disabled', false)
          $('#storePostcodeSearch').prop('disabled', false)

          var store_data = JSON.parse(data)
          localStorage['selectedStore'] = data

          $('#storeNameHeader').html(store_data['name'])
          $('#storeSelectorBar span').html(
            'Shopping from <b>' +
              store_data['name'] +
              '</b> in ' +
              store_data['user_postcode'] +
              '.'
          )

          location.reload()
        } else {
          $('#select-postcode').prop('disabled', false)
          $('#storePostcodeSearch').prop('disabled', false)
          alert(
            'Postcode not found. Please try another postcode or contact Palmers for assistance.'
          )
        }
      },
    })
  }

  function getDataByID(data, theID) {
    return data.filter(function (data) {
      return data.id == theID
    })
  }

  function runProductPageStockCheck(the_sku = null) {
    var thisSKU = the_sku || $('input[name=id][data-sku]').attr('data-sku')
    var store_data = JSON.parse(localStorage['selectedStore'])
    $.ajax({
      method: 'POST',
      url: 'https://shop-api.palmers.co.nz/?stock=true',
      data: {
        products: [thisSKU + ':1'],
      },
      success: function (data) {
        if (data != -1) {
          var product_data = JSON.parse(data)

          if (!the_sku) {
            $('.product-form__inventory')
              .removeClass('inventory--high')
              .removeClass('inventory--low')

            if (
              product_data[thisSKU][store_data['name'].replace('Palmers ', '')][
                'available'
              ] > 0
            ) {
              $('.product-form__inventory')
                .addClass('inventory--high')
                .text('In stock at ' + store_data['name'])
              $('.store-availability-information.selected-available').show()
              $('.store-availability-information.selected-unavailable').hide()
              $('.store-availability-information__title.text--strong').text(
                'Available at ' + store_data['name']
              )
              $('.shopify-payment-button').hide()
              //$('.product-form__add-button').removeClass('button--disabled').addClass('button--primary');
              //$('.product-form__add-button').prop('disabled', false);
              //$('.product-form__add-button').text('Add to cart');
            } else {
              $('.product-form__inventory').addClass('inventory--low')
              $('.product-form__inventory').text(
                'Sold out at ' + store_data['name']
              )
              $('.store-availability-information.selected-available').hide()
              $('.store-availability-information.selected-unavailable').show()
              $('.store-availability-information__title.text--strong').text(
                'Unavailable at ' + store_data['name']
              )
              $('.shopify-payment-button').hide()
              //$('.product-form__add-button').removeClass('button--primary').addClass('button--disabled');
              //$('.product-form__add-button').prop('disabled', true);
              //$('.product-form__add-button').text('Sold out at ' + store_data['name']);
            }
          }

          var new_html = ''
          $.each(product_data[thisSKU], function (index, location) {
            if (
              typeof store_data['other_location_data'][
                'Palmers ' + location['name']
              ] !== 'undefined'
            ) {
              new_html +=
                '<div class="store-availability-list__item"><p class="store-availability-list__location text--strong">'
              new_html +=
                store_data['other_location_data'][
                  'Palmers ' + location['name']
                ]['name'] + '</p>'
              new_html +=
                '<div class="store-availability-list__item-info"><div class="store-availability-list__stock">'
              if (product_data[thisSKU][location['name']]['available'] > 0) {
                new_html +=
                  '<svg focusable="false" class="icon icon--store-availability-in-stock" viewBox="0 0 18 14" role="presentation"><path d="M2 6l5 5 9-9" stroke="#00C200" stroke-width="3" fill="none"></path></svg> Available'
              } else {
                new_html +=
                  '<svg focusable="false" class="icon icon--store-availability-out-of-stock" viewBox="0 0 18 14" fill="none" role="presentation"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 10l-2 2-4-4-4 4-2-2 4-4-4-4 2-2 4 4 4-4 2 2-4 4 4 4z" fill="#FD1A20"></path></svg> Unavailable'
              }
              new_html += '</div><div class="store-availability-list__contact">'
              new_html +=
                store_data['other_location_data'][
                  'Palmers ' + location['name']
                ]['address_line_1']
              if (
                store_data['other_location_data'][
                  'Palmers ' + location['name']
                ]['address_line_2'].length > 0
              ) {
                new_html +=
                  ', ' +
                  store_data['other_location_data'][
                    'Palmers ' + location['name']
                  ]['address_line_2']
              }
              new_html +=
                '<br>' +
                store_data['other_location_data'][
                  'Palmers ' + location['name']
                ]['city'] +
                ', '
              new_html +=
                store_data['other_location_data'][
                  'Palmers ' + location['name']
                ]['region']
              new_html +=
                ', ' +
                store_data['other_location_data'][
                  'Palmers ' + location['name']
                ]['postcode']
              new_html +=
                '<br>Phone: ' +
                store_data['other_location_data'][
                  'Palmers ' + location['name']
                ]['phone'] +
                '</div></div></div>'
            }
          })
          $('.store-availabilities-list.modal__content').html(new_html)
        }
      },
    })
  }

  function runCartStockCheck() {
    var skuQuery = []
    var allSKUs = $('.line-sku').each(function () {
      skuQuery.push(
        $(this).text() +
          ':' +
          ($(this)
            .parents('.line-item')
            .find('.quantity-selector__value')
            .val() || 1)
      )
    })

    var checkoutStatus = false
    var store_data = JSON.parse(localStorage['selectedStore'])
    $.ajax({
      method: 'POST',
      url:
        'https://shop-api.palmers.co.nz/?stock=true&cart=true&bc=' +
        store_data['branch'],
      data: {
        products: skuQuery,
      },
      success: function (data) {
        if (data != -1) {
          var product_data = JSON.parse(data)
          for (var key of Object.keys(product_data)) {
            $(
              '.line-item__meta[data-sku=' +
                key +
                '] .product-label.product-label--custom1'
            ).remove()
            $(
              '.line-item__meta[data-sku=' +
                key +
                '] .product-label.product-label--custom2'
            ).remove()
            if (product_data[key] == true) {
              $('.line-item__meta[data-sku=' + key + ']').prepend(
                '<span class="product-label product-label--custom2">Available at ' +
                  store_data['name'] +
                  '</span>'
              )
            } else {
              $('.line-item__meta[data-sku=' + key + ']').prepend(
                '<span class="product-label product-label--custom1">Unavailable at ' +
                  store_data['name'] +
                  '</span>'
              )
            }
          }
        }
      },
    })
  }

  $('#storePostcodeSearch').on('click touch', function () {
    $(this).prop('disabled', true)
    $('#select-postcode').prop('disabled', true)
    runPostcodeCheck()
  })

  if (localStorage['selectedStore']) {
    var store_data = JSON.parse(localStorage['selectedStore'])
    $('#storeNameHeader').html(store_data['name'])
    $('#storeSelectorBar span').html(
      'Shopping from <b>' +
        store_data['name'] +
        '</b> in ' +
        store_data['user_postcode'] +
        '.'
    )
    $('#storeSelectorBar a').text('Change Store')
  }

  if (window.location.pathname.indexOf('/products/') !== -1) {
    if (localStorage['selectedStore']) {
      runProductPageStockCheck()
    } else {
      $('.product-form__inventory')
        .removeClass('inventory--high')
        .removeClass('inventory--low')
        .html(
          '<a href="#" data-action="open-modal" aria-controls="StoreAvailabilityModal-picker" aria-label="Select store">Please select your local Palmers store</a>'
        )
      $('.shopify-payment-button').hide()
      $('.product-form__add-button')
        .prop('disabled', false)
        .text('Select your Palmers store')
        .attr('data-action', 'open-modal')
        .attr('aria-controls', 'StoreAvailabilityModal-picker')
        .attr('aria-label', 'Select store')
    }
  }

  if (
    window.location.pathname.indexOf('/cart') !== -1 ||
    ($('.line-sku').length > 0 && $('.line-item__meta').length > 0)
  ) {
    if (localStorage['selectedStore']) {
      document.addEventListener('cart:rerendered', function (event) {
        runCartStockCheck()
        Zapiet.start(ZapietWidgetConfig)
      })
      runCartStockCheck()
      var store_data = JSON.parse(localStorage['selectedStore'])
      if (window.ZapietEvent) {
        window.ZapietEvent.listen('selected_method', function () {
          setTimeout(function () {
            if ($('.checkoutMethodContainer').hasClass('pickup')) {
              $('#pickupGeoSearchField').val(store_data['user_postcode'])
              $('#pickupGeoSearchField').siblings('.button').click()
              setTimeout(function () {
                $(
                  'input[name=location_id][value=' + store_data['id'] + ']'
                ).click()
                $(
                  '#storePickupApp .checkoutMethodContainer .locations'
                ).scrollTop(
                  $(
                    '#storePickupApp .checkoutMethodContainer .locations'
                  ).scrollTop() +
                    ($(
                      'input[name=location_id][value=' + store_data['id'] + ']'
                    ).position().top -
                      $(
                        '#storePickupApp .checkoutMethodContainer .locations'
                      ).position().top) -
                    $(
                      '#storePickupApp .checkoutMethodContainer .locations'
                    ).height() /
                      2 +
                    $(
                      'input[name=location_id][value=' + store_data['id'] + ']'
                    ).height() /
                      2
                )
              }, 1200)
            } else {
              $('#deliveryGeoSearchField').val(store_data['user_postcode'])
              $('#deliveryGeoSearchField').siblings('.button').click()
            }
          }, 1000)
        })
        window.ZapietEvent.listen('widget_loaded', function () {
          setTimeout(function () {
            $('#deliveryGeoSearchField').val(store_data['user_postcode'])
            $('#deliveryGeoSearchField').siblings('.button').click()
          }, 1000)
        })
      }
    } else if (window.location.pathname.indexOf('/cart') !== -1) {
      $('#storePickupApp').after(
        '<button type="button" name="select-store" class="cart-recap__checkout button button--primary button--full button--large" data-action="open-modal" aria-controls="StoreAvailabilityModal-picker" aria-label="Select store">Select your Palmers store</button>'
      )
      $('#storePickupApp').remove()
      $('button[name=checkout]').remove()
    }
  }

  if (!localStorage['selectedStore']) {
    $('.item-availability-modal-opener.ca_restyle_availability').hide()
  }
  let product_recommendations_updated = false
  if ($('.product-recommendations')) {
    $('.product-recommendations').on('DOMSubtreeModified', function () {
      if (!product_recommendations_updated) {
        product_recommendations_updated = true
        attachCLicksToavailabilityOpeners()
        runCartStockCheck()
      }
    })
  }
  $(document).on('theme:loading:end', (e) => {
    attachCLicksToavailabilityOpeners()
    runCartStockCheck()
  })
  const attachCLicksToavailabilityOpeners = function () {
    $('.item-availability-modal-opener').on('click touch', function (e) {
      const sku = $(this).data('sku')
      const title = $(this).data('title')
      if (sku && localStorage['selectedStore']) {
        $('#general-availability-modal .modal__title').html(title)
        $(
          '#general-availability-modal .store-availabilities-list.modal__content'
        ).html('<h4>Loading...</h4>')
        runProductPageStockCheck(sku)
      } else {
        return false
      }
    })
  }
  attachCLicksToavailabilityOpeners()
})
