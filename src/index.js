import moment from 'moment-hijri'
import momenttz from 'moment-timezone'

/* JAMAAH CALC */
function jamaahCalc (num, time, settings) {
  const jamaahMethodSetting = settings.jamaahmethods[num]
  const jamaahOffsetSetting = settings.jamaahoffsets[num]

  let jamaahOffset
  switch (jamaahMethodSetting) {
    case 'afterthis':
      jamaahOffset = parseInt((jamaahOffsetSetting[0] * 60) + jamaahOffsetSetting[1], 10)
      break
    case 'fixed':
      jamaahOffset = (moment().month(time.get('month')).date(time.get('date')).hour(jamaahOffsetSetting[0])
        .minute(jamaahOffsetSetting[1]))
        .diff(time, 'minutes')
      if (moment().month(time.get('month')).date(time.get('date')).hour(jamaahOffsetSetting[0])
        .minute(jamaahOffsetSetting[1])
        .isBefore(time)) jamaahOffset -= 1
      break
    // case 'beforenext':
    //   jamaahOffset = (timenext.subtract({
    //     minutes: parseInt(jamaahOffsetSetting[0] * 60 + jamaahOffsetSetting[1], 10)
    //   })).diff(time, 'minutes')
    //   break
    case '':
      jamaahOffset = ''
      break
    default:
      jamaahOffset = 0
  }
  return jamaahOffset
}

function prayersCalc (tomorrow = 0, settings, timetable, jamaahShow = true, join = '0', log = false, test = false) {
  // DST settings
  let newtomorrow = tomorrow
  const city = 'Europe/Dublin'
  let dst
  const dstcheck = momenttz(moment().add(tomorrow, 'day'), city).isDST()

  if (!dstcheck && moment().format('M') === '10') dst = -1
  else if (dstcheck && moment().format('M') === '3') dst = 1
  else dst = 0

  let current
  let next
  let list

  const month = moment().add(dst, 'hour').month() + 1
  const date = moment().add(dst, 'hour').date()

  const tmonth = moment().add(1, 'days').add(dst, 'hour').month() + 1
  const tdate = moment().add(1, 'days').add(dst, 'hour').date()

  const prayerNames = ['fajr', 'shurooq', 'dhuhr', 'asr', 'maghrib', 'isha']

  const listToday = []
  const listTomorrow = []

  prayerNames.forEach((prayer, index) => listToday.push({
    name: prayer,
    time: moment({
      hour: timetable[month][date][index][0],
      minute: timetable[month][date][index][1]
    }).add(dst, 'hour'),
    jamaah: {
      // num, time, /timenext/, settings {jamaahmethods, jamaahoffsets}
      offset: jamaahCalc(index, moment({ hour: timetable[month][date][index][0], minute: timetable[month][date][index][1] }), { jamaahmethods: settings.jamaahmethods, jamaahoffsets: settings.jamaahoffsets }),
      time: moment({
        hour: timetable[month][date][index][0],
        minute: timetable[month][date][index][1]
      }).add(dst, 'hour')
        .add(jamaahCalc(index, moment({ hour: timetable[month][date][index][0], minute: timetable[month][date][index][1] }), { jamaahmethods: settings.jamaahmethods, jamaahoffsets: settings.jamaahoffsets }), 'minutes')
    }
  }))
  prayerNames.forEach((prayer, index) => listTomorrow.push({
    name: prayer,
    time: moment({
      hour: timetable[tmonth][tdate][index][0],
      minute: timetable[tmonth][tdate][index][1]
    }).add(1, 'day').add(dst, 'hour'),
    jamaah: {
      offset: jamaahCalc(index, moment({ hour: timetable[tmonth][tdate][index][0], minute: timetable[tmonth][tdate][index][1] }), { jamaahmethods: settings.jamaahmethods, jamaahoffsets: settings.jamaahoffsets }),
      time: moment({
        hour: timetable[tmonth][tdate][index][0],
        minute: timetable[tmonth][tdate][index][1]
      }).add(1, 'day').add(dst, 'hour')
        .add(jamaahCalc(index, moment({ hour: timetable[tmonth][tdate][index][0], minute: timetable[tmonth][tdate][index][1] }), { jamaahmethods: settings.jamaahmethods, jamaahoffsets: settings.jamaahoffsets }), 'minutes')
    }
  }))

  let timePeriod

  // sort issue when adhan is after iqamah for isha
  if (jamaahShow && listToday[5].jamaah.time.isBefore(listToday[5].time)) listToday[5].time = listToday[5].jamaah.time
  if (jamaahShow && listTomorrow[5].jamaah.time.isBefore(listTomorrow[5].time)) listTomorrow[5].time = listTomorrow[5].jamaah.time

  if (moment().isBetween(moment().startOf('day'), listToday[0].time)) {
    // ***** midnight-fajr *****
    newtomorrow = 0
    current = { name: 'midnight', time: moment().startOf('day') }
    next = { name: listToday[0].name, time: listToday[0].time }
    list = listToday
    timePeriod = 'case 0'
  } else if (!jamaahShow) {
    /**************************
     *     NOT JAMAAHSHOW     *
     * ********************** */
    if (moment().isBetween(listToday[0].time, listToday[1].time)) {
      // ***** fajr-shurooq *****
      current = { name: listToday[0].name, time: listToday[0].time }
      next = { name: listToday[1].name, time: listToday[1].time }
      list = listToday
      newtomorrow = 0
      timePeriod = 'case N1'
    } else if (moment().isBetween(listToday[1].time, listToday[2].time)) {
      // ***** shurooq-dhuhr *****
      current = { name: listToday[1].name, time: listToday[1].time }
      next = { name: listToday[2].name, time: listToday[2].time }
      list = listToday
      newtomorrow = 0
      timePeriod = 'case N2'
    } else if (moment().isBetween(listToday[2].time, listToday[3].time)) {
      // ***** dhuhr-asr *****
      current = { name: listToday[2].name, time: listToday[2].time }
      next = { name: listToday[3].name, time: listToday[3].time }
      list = listToday
      newtomorrow = 0
      timePeriod = 'case N3'
    } else if (moment().isBetween(listToday[3].time, listToday[4].time)) {
      // ***** asr-maghrib *****
      current = { name: listToday[3].name, time: listToday[3].time }
      next = { name: listToday[4].name, time: listToday[4].time }
      list = listToday
      newtomorrow = 0
      timePeriod = 'case N4'
    } else if (moment().isBetween(listToday[4].time, listToday[5].time)) {
      // ***** maghrib-isha *****
      current = { name: listToday[4].name, time: listToday[4].time }
      next = { name: listToday[5].name, time: listToday[5].time }
      list = listToday
      newtomorrow = 0
      timePeriod = 'case N5'
    } else if (moment().isBetween(listToday[5].time, moment().endOf('day'))) {
      // ***** isha-midnight *****
      current = { name: listToday[5].name, time: listToday[5].time }
      next = { name: listTomorrow[0].name, time: listTomorrow[0].time }
      list = listTomorrow
      newtomorrow = 1
      timePeriod = 'case N6'
    }
  } else {
    /**************************
     *       JAMAAHSHOW       *
     * ********************** */
    if (moment().isBetween(listToday[0].time, listToday[0].jamaah.time)) {
      // ***** fajr-fajr jamaah *****
      current = { name: listToday[0].name, time: listToday[0].time }
      next = { name: `${listToday[0].name} jamaah`, time: listToday[0].jamaah.time }
      list = listToday
      newtomorrow = 0
      timePeriod = 'case J1'
    } else if (moment().isBetween(listToday[0].jamaah.time, listToday[1].time)) {
      // ***** fajr jamaah-shurooq *****
      current = { name: listToday[0].name, time: listToday[0].jamaah.time }
      next = { name: listToday[1].name, time: listToday[1].time }
      list = listToday
      newtomorrow = 0
      timePeriod = 'case J2'
    } else if (moment().isBetween(listToday[1].time, listToday[2].time)) {
      // ***** shurooq-dhuhr *****
      current = { name: listToday[1].name, time: listToday[1].time }
      next = { name: listToday[2].name, time: listToday[2].time }
      list = listToday
      newtomorrow = 0
      timePeriod = 'case J3'
    } else if (moment().isBetween(listToday[2].time, listToday[2].jamaah.time)) {
      // ***** dhuhr-dhuhr jamaah *****
      current = { name: listToday[2].name, time: listToday[2].time }
      next = { name: `${listToday[2].name} jamaah`, time: listToday[2].jamaah.time }
      list = listToday
      newtomorrow = 0
      timePeriod = 'case J4'
    } else if (moment().isBetween(listToday[2].jamaah.time, listToday[3].time)) {
      // ***** dhuhr jamaah-asr *****
      current = { name: listToday[2].name, time: listToday[2].jamaah.time }
      next = { name: listToday[3].name, time: listToday[3].time }
      list = listToday
      newtomorrow = 0
      timePeriod = 'case J5'
    } else if (moment().isBetween(listToday[3].time, listToday[3].jamaah.time)) {
      // ***** asr-asr jamaah *****
      current = { name: listToday[3].name, time: listToday[3].time }
      next = { name: `${listToday[3].name} jamaah`, time: listToday[3].jamaah.time }
      list = listToday
      newtomorrow = 0
      timePeriod = 'case J6'
    } else if (moment().isBetween(listToday[3].jamaah.time, listToday[4].time)) {
      // ***** asr jamaah-maghrib *****
      current = { name: listToday[3].name, time: listToday[3].jamaah.time }
      next = { name: listToday[4].name, time: listToday[4].time }
      list = listToday
      newtomorrow = 0
      timePeriod = 'case J7'
    } else if (moment().isBetween(listToday[4].time, listToday[4].jamaah.time)) {
      // ***** maghrib-maghrib jamaah *****
      current = { name: listToday[4].name, time: listToday[4].time }
      next = { name: `${listToday[4].name} jamaah`, time: listToday[4].jamaah.time }
      list = listToday
      newtomorrow = 0
      timePeriod = 'case J8'
    } else if (moment().isBetween(listToday[4].jamaah.time, listToday[5].time)) {
      // ***** maghrib jamaah-isha *****
      current = { name: listToday[4].name, time: listToday[4].jamaah.time }
      next = { name: listToday[5].name, time: listToday[5].time }
      list = listToday
      newtomorrow = 0
      timePeriod = 'case J9'
    } else if (moment().isBetween(listToday[5].time, listToday[5].jamaah.time)) {
      // ***** isha-isha jamaah *****
      current = { name: listToday[5].name, time: listToday[5].time }
      next = { name: `${listToday[5].name} jamaah`, time: listToday[5].jamaah.time }
      list = listToday
      newtomorrow = 0
      timePeriod = 'case J10'
    } else if (moment().isBetween(listToday[5].jamaah.time, moment().endOf('day'))) {
      // ***** isha jamaah-midnight *****
      current = { name: listToday[5].name, time: listToday[5].jamaah.time }
      next = { name: listTomorrow[0].name, time: listTomorrow[0].time }
      list = listTomorrow
      newtomorrow = 1
      timePeriod = 'case J11'
    }
  }

  if (log) {
    console.log(moment().format('M/D H'), timePeriod, '| current:', current.name, current.time.format('H:mm'), '| next:', next.name, next.time.format('H:mm'), '| tomorrow:', tomorrow)
  }

  // listToday.forEach(function (el) {
  //   console.log(el.name, ':', el.time.format('H:mm'))
  // })

  if (test) return 'Success!'
  return {
    list, current, next, newtomorrow
  }
}

function dayCalc (tomorrow = 0, settings = { hijrioffset: 0 }, test = false) {
  const gregorian = moment().add(tomorrow, 'day').format('dddd, D MMMM YYYY')
  const hijri = moment().add((parseInt(settings.hijrioffset, 10) + parseInt(tomorrow, 10)), 'day').format('iD iMMMM iYYYY')
  let ramadanCountdown
  // console.log(moment().format('iM'))
  if (moment().format('iM') === '8') {
    ramadanCountdown = moment.duration(moment().endOf('imonth').diff(moment().add((parseInt(settings.hijrioffset, 10) + parseInt(tomorrow, 10)), 'day'))).humanize()
  } else ramadanCountdown = ''

  if (test) return 'Success!'
  return { gregorian, hijri, ramadanCountdown }
}

export default prayersCalc

export { prayersCalc, dayCalc }
