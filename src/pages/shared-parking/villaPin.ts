/** 클릭 동작이 없는 빌라 번호 핀. 지도 좌표와 맞추는 기준점은 아래 꼭짓점이다. */
export function villaPin(number: number, name: string, color: string): HTMLElement {
  const pin = document.createElement('div')
  pin.setAttribute('role','img')
  pin.setAttribute('aria-label',`${number}번 ${name}`)
  pin.style.cssText = 'width:36px;height:44px;position:relative;pointer-events:none;filter:drop-shadow(0 2px 4px #0005)'
  const head = document.createElement('div')
  head.textContent = String(number)
  head.style.cssText = `position:relative;z-index:1;width:36px;height:36px;box-sizing:border-box;border:3px solid white;border-radius:50%;background:${color};color:white;font:800 16px/30px sans-serif;text-align:center`
  const tip = document.createElement('div')
  tip.style.cssText = `position:absolute;left:10px;top:29px;width:16px;height:12px;background:${color};clip-path:polygon(0 0,100% 0,50% 100%)`
  pin.append(tip,head)
  return pin
}
