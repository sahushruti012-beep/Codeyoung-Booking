import { DateTime, IANAZone } from 'luxon';

export function validTimeZone(zone) {
  return typeof zone === 'string' && IANAZone.isValidZone(zone);
}

export function parseParentLocalTime(localDateTime, zone) {
  if (!validTimeZone(zone)) {
    const error = new Error('Please choose a valid time zone.');
    error.status = 400;
    throw error;
  }
  if (typeof localDateTime !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(localDateTime)) {
    const error = new Error('Start time must be in YYYY-MM-DDTHH:mm format.');
    error.status = 400;
    throw error;
  }

  const [datePart, timePart] = localDateTime.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  const dt = DateTime.fromObject({ year, month, day, hour, minute }, { zone });
  if (!dt.isValid || dt.toFormat("yyyy-MM-dd'T'HH:mm") !== localDateTime) {
    const error = new Error('That local time does not exist because of a daylight-saving clock change. Please choose another time.');
    error.status = 400;
    throw error;
  }

  const possible = dt.getPossibleOffsets();
  if (possible.length > 1) {
    const error = new Error('That local time occurs twice because of a daylight-saving clock change. Please choose another time.');
    error.status = 400;
    throw error;
  }
  return dt;
}

export function toSqlUtc(dateTime) {
  return dateTime.toUTC().toFormat('yyyy-LL-dd HH:mm:ss');
}

export function formatInZone(utcDateTime, zone) {
  return DateTime.fromSQL(utcDateTime, { zone: 'utc' }).setZone(zone).toFormat("ccc, dd LLL yyyy 'at' hh:mm a ZZZZ");
}
