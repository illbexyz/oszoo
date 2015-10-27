class window.KeysymsCodeConverter
  constructor: ->
    @keyCodes =
      8: 65288
      9: 65289
      13: 65293
      16: 65505
      17: 65507
      18: 65513
      19: 65300
      20: 65509
      27: 65307
      33: 0
      34: 0
      35: 65367
      36: 65360
      37: 65361
      38: 65362
      39: 65363
      40: 65364
      45: 65379
      46: 65535
      48: 48
      49: 49
      50: 50
      51: 51
      52: 52
      53: 53
      54: 54
      55: 55
      56: 56
      57: 57
      65: 97
      66: 98
      67: 99
      68: 100
      69: 101
      70: 102
      71: 103
      72: 104
      73: 105
      74: 106
      75: 107
      76: 108
      77: 109
      78: 110
      79: 111
      80: 112
      81: 113
      82: 114
      83: 115
      84: 116
      85: 117
      86: 118
      87: 119
      88: 120
      89: 121
      90: 122

  convert: (code) ->
    @keyCodes[code]
