// 'HH:MM' 형식의 30분 단위 시간 목록 (from, to 포함)
export function halfHourOptions(from: string, to: string) {
  const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5))
  const options: string[] = []
  for (let minutes = toMinutes(from); minutes <= toMinutes(to); minutes += 30) {
    options.push(`${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`)
  }
  return options
}
