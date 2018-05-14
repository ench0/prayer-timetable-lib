import moment from 'moment-hijri'
import momenttz from 'moment-timezone'

import defsettings from './settings.json'
import deftimetable from './cities/dublin.json'

class TimetableApp {
  /* JAMAAH CALC */
  jamaahCalc(num, time, timenext, settings) {
    const jamaahMethodSetting = this.settings.jamaahmethods[num]
    const jamaahOffsetSetting = this.settings.jamaahoffsets[num]

    let jamaahOffset
    switch (jamaahMethodSetting) {
      case 'afterthis':
        jamaahOffset = parseInt(jamaahOffsetSetting[0] * 60 + jamaahOffsetSetting[1], 10)
        break
      case 'fixed':
        jamaahOffset = (moment().month(time.get('month')).date(time.get('date')).hour(jamaahOffsetSetting[0])
          .minute(jamaahOffsetSetting[1]))
          .diff(time, 'minutes')
        if (moment().month(time.get('month')).date(time.get('date')).hour(jamaahOffsetSetting[0])
          .minute(jamaahOffsetSetting[1])
          .isBefore(time)) jamaahOffset--
        break
      case 'beforenext':
        jamaahOffset = (timenext.subtract({
          minutes: parseInt(jamaahOffsetSetting[0] * 60 + jamaahOffsetSetting[1], 10)
        })).diff(time, 'minutes')
        break
      case '':
        jamaahOffset = ''
        break
      default:
        jamaahOffset = 0
    }
    return jamaahOffset
  }

  prayersCalc (tomorrow) {
    // DST settings
    const city = 'Europe/Dublin'
    let dst
    const dstcheck = momenttz(moment().add(tomorrow, 'day'), city).isDST()

    if (!dstcheck && moment().format('M') === '10') dst = -1
    else if (dstcheck && moment().format('M') === '3') dst = 1
    else dst = 0

    let current,
      next,
      list

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
        hour: this.state.timetable[month][date][index][0],
        minute: this.state.timetable[month][date][index][1]
      }).add(dst, 'hour'),
      jamaah: {
        offset: this.jamaahCalc(index, moment({ hour: this.state.timetable[month][date][index][0], minute: this.state.timetable[month][date][index][1] })),
        time: moment({
          hour: this.state.timetable[month][date][index][0],
          minute: this.state.timetable[month][date][index][1]
        }).add(dst, 'hour')
          .add(this.jamaahCalc(index, moment({ hour: this.state.timetable[month][date][index][0], minute: this.state.timetable[month][date][index][1] })), 'minutes')
      }
    }))
    prayerNames.forEach((prayer, index) => listTomorrow.push({
      name: prayer,
      time: moment({
        hour: this.state.timetable[tmonth][tdate][index][0],
        minute: this.state.timetable[tmonth][tdate][index][1]
      }).add(1, 'day').add(dst, 'hour'),
      jamaah: {
        offset: this.jamaahCalc(index, moment({ hour: this.state.timetable[tmonth][tdate][index][0], minute: this.state.timetable[tmonth][tdate][index][1] })),
        time: moment({
          hour: this.state.timetable[tmonth][tdate][index][0],
          minute: this.state.timetable[tmonth][tdate][index][1]
        }).add(1, 'day').add(dst, 'hour')
          .add(this.jamaahCalc(index, moment({ hour: this.state.timetable[tmonth][tdate][index][0], minute: this.state.timetable[tmonth][tdate][index][1] })), 'minutes')
      }
    }))

    var timePeriod

    if (moment().isBetween(moment().startOf('day'), listToday[0].time)) {
      tomorrow = 0
      current = { name: 'midnight', time: moment().startOf('day') }
      next = { name: listToday[0].name, time: listToday[0].time }
      list = listToday
      timePeriod = 'case 1'
    }
    // fajr-shurooq
    else if (moment().isBetween(listToday[0].time, listToday[1].time)) {
      // jamaah
      if (this.state.jamaahShow === true && moment().isBetween(listToday[0].time, listToday[0].jamaah.time)) {
        next = { name: `${listToday[0].name} jamaah`, time: listToday[0].jamaah.time }
      } else {
        next = { name: listToday[1].name, time: listToday[1].time }
      }
      tomorrow = 0
      current = { name: listToday[0].name, time: listToday[0].time }
      list = listToday
      timePeriod = 'case 2'
    }
    // shurooq-dhuhr
    else if (moment().isBetween(listToday[1].time, listToday[2].time)) {
      tomorrow = 0
      current = { name: listToday[1].name, time: listToday[1].time }
      next = { name: listToday[2].name, time: listToday[2].time }
      list = listToday
      timePeriod = 'case 3'
    }
    // dhuhr-asr
    else if (moment().isBetween(listToday[2].time, listToday[3].time)) {
      // jamaah
      if (this.state.jamaahShow === true && moment().isBetween(listToday[2].time, listToday[2].jamaah.time)) {
        next = { name: `${listToday[2].name} jamaah`, time: listToday[2].jamaah.time }
      } else {
        next = { name: listToday[3].name, time: listToday[3].time }
      }
      tomorrow = 0
      current = { name: listToday[2].name, time: listToday[2].time }
      list = listToday
      timePeriod = 'case 4'
    }
    // asr-maghrib
    else if (moment().isBetween(listToday[3].time, listToday[4].time)) {
      // jamaah
      if (this.state.jamaahShow === true && moment().isBetween(listToday[3].time, listToday[3].jamaah.time)) {
        next = { name: `${listToday[3].name} jamaah`, time: listToday[3].jamaah.time }
      } else {
        next = { name: listToday[4].name, time: listToday[4].time }
      }
      tomorrow = 0
      current = { name: listToday[3].name, time: listToday[3].time }
      list = listToday
      timePeriod = 'case 5'
    }
    // maghrib-isha
    else if (moment().isBetween(listToday[4].time, listToday[5].time)) {
      // if joined
      if (this.state.jamaahShow === true && this.state.join === '1' && moment().isBetween(listToday[4].time, listToday[4].jamaah.time)) {
        next = { name: `${listToday[4].name} jamaah`, time: listToday[4].jamaah.time }
        tomorrow = 0
        list = listToday
        timePeriod = 'case 6a'
      }
      else if (this.state.jamaahShow === true && this.state.join === '1') {
        next = { name: listTomorrow[0].name, time: listTomorrow[0].time }
        tomorrow = 1
        list = listTomorrow
        timePeriod = 'case 6b'
      }
      // jamaah
      else if (this.state.jamaahShow === true && moment().isBetween(listToday[4].time, listToday[4].jamaah.time)) {
        next = { name: `${listToday[4].name} jamaah`, time: listToday[4].jamaah.time }
        tomorrow = 0
        list = listToday
      } else {
        next = { name: listToday[5].name, time: listToday[5].time }
        tomorrow = 0
        list = listToday
      }
      current = { name: listToday[4].name, time: listToday[4].time }

      timePeriod = 'case 6c'
    }
    // isha-midnight
    else if (moment().isBetween(listToday[5].time, moment().endOf('day'))) {
      // if joined
      if (this.state.jamaahShow === true && this.state.join === '1') {
        next = { name: listTomorrow[0].name, time: listTomorrow[0].time }
        tomorrow = 1
        list = listTomorrow
        timePeriod = 'case 7a'
      }
      // jamaah
      else if (this.state.jamaahShow === true && this.state.join !== '1' && moment().isBetween(listToday[5].time, listToday[5].jamaah.time)) {
        next = { name: `${listToday[5].name} jamaah`, time: listToday[5].jamaah.time }
        tomorrow = 0
        list = listToday
        timePeriod = 'case 7b'
      } else {
        tomorrow = 1
        list = listTomorrow
        next = { name: listTomorrow[0].name, time: listTomorrow[0].time }
        timePeriod = 'case 7c'
      }

      current = { name: listToday[5].name, time: listToday[5].time }
    } else {
      tomorrow = 1
      current = { name: listToday[5].name, time: listToday[5].time }// .clone().add(-1, 'day')}
      list = listTomorrow
      next = { name: listTomorrow[0].name, time: listTomorrow[0].time }
      timePeriod = 'case 8'
    }

    console.log(moment().format('M/D H'), timePeriod, '| current:', current.name, '| next:', next.name, '| tomorrow:', tomorrow)


    // console.log(
    //     'now:', moment().format("DD/MM - H:mm"),
    //     '\nfajr:', listToday[0].time.format("DD/MM - H:mm"),
    //     '\nshurooq:', listToday[1].time.format("DD/MM - H:mm"),
    //     '\ndhuhr:', listToday[2].time.format("DD/MM - H:mm"),
    //     '\nmaghrib:', listToday[4].time.format("DD/MM - H:mm"),
    //     '\nisha:', listToday[5].time.format("DD/MM - H:mm"),
    //     '\ncurrent:', current.time.format("DD/MM - H:mm"),
    //     '\nnext:', next.time.format("DD/MM - H:mm")
    // )

    return {
      list, current, next, tomorrow
    }
  }

  dayCalc (tomorrow) {
    const gregorian = moment().add(tomorrow, 'day').format('dddd, D MMMM YYYY')
    const hijri = moment().add((parseInt(this.state.settings.hijrioffset, 10) + parseInt(tomorrow, 10)), 'day').format('iD iMMMM iYYYY')
    let ramadanCountdown
    // console.log(moment().format('iM'))
    if (moment().format('iM') === '8') {
      ramadanCountdown = moment.duration(moment().endOf('imonth').diff(moment().add((parseInt(this.state.settings.hijrioffset) + parseInt(tomorrow)), 'day'))).humanize()
    }
    else ramadanCountdown = ''

    return { gregorian, hijri, tomorrow, ramadanCountdown }
  }
}


export default TimetableApp


// export default () => 'Welcome to prayer-timetable-lib';
