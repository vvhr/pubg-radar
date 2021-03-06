const ACTOR_TYPES = require('./constants').ACTOR_TYPES

const toLocalISOString = (time) => {
  time = time instanceof Date ? time : new Date(time)
  var tzoffset = time.getTimezoneOffset() * 60000
  return (new Date(time - tzoffset)).toISOString().slice(0, -1).slice(5)
}

const getActorType = (pathName) => {
  if (pathName.startsWith('Default__TSLGameState')  ) {
    return ACTOR_TYPES.GAME_STATE
  }
  if (pathName.startsWith('Default__Player')) {
    return ACTOR_TYPES.PLAYER
  }
  if (/DroppedItemGroup/.test(pathName)) {
    return ACTOR_TYPES.DROPPED_ITEM_GROUP
  }
  if (/DroppedItem/.test(pathName)) {
    return ACTOR_TYPES.DROPPED_ITEM
  }
  if (/Aircraft/.test(pathName)) {
    return ACTOR_TYPES.PLANE
  }
  if (/Parachute/.test(pathName)) {
    return ACTOR_TYPES.PARACHUTE
  }
  // HACK: map all vehicles to CAR, to make logic easier
  if (/bike|buggy|sidecart/i.test(pathName)) {
    return ACTOR_TYPES.CAR  // should be ACTOR_TYPES.TWO_SEAT_CAR
  }
  if (/dacia|uaz|pickup/i.test(pathName)) {
    return ACTOR_TYPES.CAR // should be ACTOR_TYPES.FOUR_SEAT_CAR
  }
  if (/bus|van/i.test(pathName)) {
    return ACTOR_TYPES.CAR // should be ACTOR_TYPES.SIX_SEAT_CAR
  }
  if (/aquarail|boat|pg117/i.test(pathName)) {
    return ACTOR_TYPES.CAR // should be ACTOR_TYPES.BOAT
  }
  if (/carapackage/i.test(pathName)) {
    return ACTOR_TYPES.AIRDROP
  }
  if (/SmokeBomb|Molotov|Grenade|FlashBang|BigBomb/i.test(pathName)) {
    return ACTOR_TYPES.THROW
  }
  if (/Default__TslPlayerState/.test(pathName)) {
    return ACTOR_TYPES.PLAYER_STATE
  }
  if (/Default__Team/i.test(pathName)) {
    return ACTOR_TYPES.TEAM
  }
  if (/DeathDropItemPackage/i.test(pathName)) {
    return ACTOR_TYPES.BOX
  }
  // if (!unameSet.has(pathName)) {
  //   console.log('!!!!!!!', pathName)
  //   unameSet.add(pathName)
  // }
  return ACTOR_TYPES.OTHER
}

const classNameMap = {
  'Attach': {
    'Weapon': {
      'Lower': {
        'AngledForeGrip':     ['三角', 0b10000000000000000000000000000000],
        'Foregrip':           ['垂直', 0b10000000000000000000000000000000]
      },
      'Magazine': {
        'Extended': {
          //'Medium': '冲长',
          'Large':            ['B扩', 0b01000000000000000000000000000000],
          'SniperRifle':      ['J扩', 0b00000100000000000000000000000000]
        },
        'ExtendedQuickDraw': {
          //'Medium': '冲长快',
          'Large':            ['B快扩', 0b01000000000000000000000000000000],
          'SniperRifle':      ['J快扩', 0b00000100000000000000000000000000]
        }
      },
      'Muzzle': {
        'Compensator': {
          'Large':            ['B补偿', 0b00100000000000000000000000000000]
        },
        'FlashHider': {
          'Large':            ['B消焰', 0b00100000000000000000000000000000],
          'SniperRifle':      ['J消焰', 0b00000010000000000000000000000000]
        },
        'Suppressor': {
          //'Medium': '冲消',
          'Large':            ['B消音', 0b00010000000000000000000000000000],
          'SniperRifle':      ['J消音', 0b00000001000000000000000000000000]
        },
      },
      'Stock': {
        'AR':                 ['B枪托', 0b00001000000000000000000000000000],
        'SniperRifle': {
          'BulletLoops':      ['子弹袋', 0b00000000100000000000000000000000],
          'CheekPad':         ['J枪托', 0b00000000100000000000000000000000]
        }
      },
      'Upper': {
        'DotSight':           ['红点', 0b00000000010000000000000000000000],
        'Holosight':          ['全息', 0b00000000010000000000000000000000],
        'Aimpoint':           ['2倍', 0b00000000010000000000000000000000],
        'ACOG':               ['4倍', 0b00000000001000000000000000000000],
        'CQBSS':              ['8倍', 0b00000000001000000000000000000000]
      }
    }
  },
  'Weapon': {
    'Grenade':                ['雷',       0b00000000000100000000000000000000],
    'SmokeBomb':              ['雾',       0b00000000000010000000000000000000],
    //'FlashBang':              ['闪',       0b00000000000000000000000000000000],
    //'Molotov':                ['燃',       0b00000000000000000000000000000000],
    'M16A4':                  ['●M16A4',   0b00000000000001000000000000000000],
    'HK416':                  ['●M416',     0b00000000000000100000000000000000],
    'SCAR-L':                 ['●SCAR', 0b00000000000000010000000000000000],
    'AK47':                   ['●AKM',   0b00000000000000001000000000000000],
    'Kar98k':                 ['●98K',   0b00000000000000000100000000000000],
    'SKS':                    ['●SKS',   0b00000000000000000010000000000000],
    'Mini14':                 ['●MINI', 0b00000000000000000001000000000000],
    //'VSS':                    ['ＶＳＳ',   0b00000000000000000000000000000000],
    'Pan':                    ['锅',       0b00000000000000000000100000000000],
    //'DP28': '盘',
    //'UMP': 'ump',
    //'Vector': 'vct',
    //'uzi': 'uzi'
  },
  'Ammo': {
    //'9mm': '.9',
    //'45mm': '.45',
    '556mm':                  ['◆5.56',   0b00000000000000000000010000000000],
    '762mm':                  ['◆7.62',   0b00000000000000000000001000000000],
    //'300mm': '.3',
  },
  'Armor': {
    'C': { '01': { 'Lv3':     ['◆3J甲',     0b00000000000000000000000010000000]} },
    'D': { '01': { 'Lv2':     ['2J甲',     0b00000000000000000000000100000000]} },
  },
  'Boost': {
    'EnergyDrink':            ['饮料',     0b00000000000000000000000001000000],
    'PainKiller':             ['止疼',     0b00000000000000000000000001000000]
  },
  'Heal': {
    'FirstAid':               ['急救',     0b00000000000000000000000000100000],
    'MedKit':                 ['◆医疗',     0b00000000000000000000000000010000],
    //'Bandage':                ['绷带',     0b00000000000000000000000000000000]
  },
  'Back': {
    'C': {
      '01': { 'Lv3':          ['◆3J包',     0b00000000000000000000000000001000] },
      '02': { 'Lv3':          ['◆3J包',     0b00000000000000000000000000001000] }
    },
    'F': {
      '01': { 'Lv2':          ['2J包',     0b00000000000000000000000000001000] },
      '02': { 'Lv2':          ['2J包',     0b00000000000000000000000000001000] }
    }
  },
  'Head': {
    'F': {
      '01': { 'Lv2':          ['2J头',     0b00000000000000000000000000000100] },
      '02': { 'Lv2':          ['2J头',     0b00000000000000000000000000000100] }
    },
    'G': {
      '01': { 'Lv3':          ['◆3J头',     0b00000000000000000000000000000010] }
    }
  }
}

const friendlyNameCache = new Map()
// return [friendlyName, flags]
// if the item is not good enough, return ['',0]
const classNameToFriendlyName = (className) => {
  let result = friendlyNameCache.get(className)
  if (result) {
    return result
  }
  result = ['', 0]
  const tokens = className.split('_')
  if (tokens.length > 1 && tokens[0] === 'Item') {
    let cur = classNameMap
    for (let i = 1; i < tokens.length; i++) {
      cur = cur[tokens[i]]
      if (!cur) {
        //result = [className, 0] // when you need to debug name
        break
      }
      if (Array.isArray(cur)) {
        result = cur
      }
    }
  }
  friendlyNameCache.set(className, result)
  return result
}

function BufferNotEnoughError (message) {
  Error.captureStackTrace(this, this.constructor)
  this.name = 'BufferNotEnoughError'
  this.message = (message || '')
}
require('util').inherits(BufferNotEnoughError, Error)

module.exports = {
  toLocalISOString,
  getActorType,
  classNameToFriendlyName,
  BufferNotEnoughError
}
