/** 번호 핀 위에 남은 칸 수를 표시한다. 좌표 기준점은 아래 꼭짓점이다. */
export function villaPin(number: number, name: string, color: string, remaining: string, href: string): HTMLElement {
  const pin = document.createElement('a')
  pin.href = href
  pin.setAttribute('aria-label',`${number}번 ${name} · ${remaining}`)
  pin.style.cssText = 'display:block;width:56px;height:58px;position:relative;pointer-events:auto;cursor:pointer;text-decoration:none;filter:drop-shadow(0 2px 4px #0005)'
  const count = document.createElement('div')
  count.textContent = remaining
  count.style.cssText = 'position:absolute;top:0;left:50%;transform:translateX(-50%);white-space:nowrap;box-sizing:border-box;padding:2px 6px;border-radius:7px;background:white;color:#172B4D;font:700 10px/16px sans-serif'
  const head = document.createElement('div')
  head.textContent = String(number)
  head.style.cssText = `position:absolute;left:14px;top:24px;z-index:1;width:28px;height:28px;box-sizing:border-box;border:2px solid white;border-radius:50%;background:${color};color:white;font:800 13px/24px sans-serif;text-align:center`
  const tip = document.createElement('div')
  tip.style.cssText = `position:absolute;left:22px;top:47px;width:12px;height:10px;background:${color};clip-path:polygon(0 0,100% 0,50% 100%)`
  pin.append(count,tip,head)
  return pin
}
