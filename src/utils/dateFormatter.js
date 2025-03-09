import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/ru' // Импортируем русскую локализацию

// Подключаем плагины для относительного времени и локализации
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

// Устанавливаем русскую локализацию по умолчанию
dayjs.locale('ru')

/**
 * Форматирует дату в формат "X минут/часов/дней назад".
 * @param {string} date - Дата в формате ISO (например, "2025-03-08T18:16:29.000000Z").
 * @returns {string} - Отформатированная строка.
 */
export function formatDateFromNow(date) {
  return dayjs(date).fromNow()
}

/**
 * Форматирует дату в удобочитаемый формат (например, "8 марта 2025").
 * @param {string} date - Дата в формате ISO.
 * @returns {string} - Отформатированная строка.
 */
export function formatDateReadable(date) {
  return dayjs(date).format('LL') // LL = 8 марта 2025
}
