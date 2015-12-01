'use strict'
#------------------------------------------------------------------------------#
#------------------------- Enter Press directive ------------------------------#
#------------------------------------------------------------------------------#

module.exports = ->
  (scope, element, attrs) ->
    element.bind 'keydown keypress', (event) ->
      if event.which == 13
        scope.$apply ->
          scope.$eval attrs.enterPress
          return
        event.preventDefault()
      return
    return