'use strict'
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const fs = require('fs')
puppeteer.use(StealthPlugin())


function insert_visiability_info() {
    function get_body() {
        var body = document.getElementsByTagName('body')[0]
        return body
    }

    function insert_info(element) {
        is_visiable = element.offsetParent !== null
        element.setAttribute('is_visiable', is_visiable)
        if (is_visiable) {
            react = element.getBoundingClientRect()
            coordinate = JSON.stringify(react)
            element.setAttribute('coordinate', coordinate)
        }
    }

    function iter_node(node) {
        children = node.children
        insert_info(node)
        if (children.length !== 0) {
            for(const element of children) {
                iter_node(element)
            }
        }
    }

    function sizes() {
        let contentWidth = [...document.body.children].reduce( 
          (a, el) => Math.max(a, el.getBoundingClientRect().right), 0) 
          - document.body.getBoundingClientRect().x;
      
        return {
          windowWidth:  document.documentElement.clientWidth,
          windowHeight: document.documentElement.clientHeight,
          pageWidth:    Math.min(document.body.scrollWidth, contentWidth),
          pageHeight:   document.body.scrollHeight,
          screenWidth:  window.screen.width,
          screenHeight: window.screen.height,
          pageX:        document.body.getBoundingClientRect().x,
          pageY:        document.body.getBoundingClientRect().y,
          screenX:     -window.screenX,
          screenY:     -window.screenY - (window.outerHeight-window.innerHeight),
        }
    }

    function insert_page_info() {
        page_info = sizes()
        node = document.createElement('meta')
        node.setAttribute('name', 'page_visiability_info')
        node.setAttribute('page_info', JSON.stringify(page_info))
        document.getElementsByTagName('head')[0].appendChild(node)
    }
    
    insert_page_info()
    body = get_body()
    iter_node(body)
}





class GneRender{
    constructor(headless, executablePath) {
        this.headless = headless
        this.executablePath = executablePath
        this.page = null;
    }

    async init() {
        const browser = await puppeteer.launch({
            headless: this.headless,
            executablePath: this.executablePath
        })
        
        this.page = await browser.newPage() 
    }



    async test() {
        await this.page.goto('https://www.kingname.info')
        await this.page.evaluate(insert_visiability_info)
        const html = await this.page.content()
        fs.writeFileSync('test.html', html)

    }

}


(async () => {
    const render = new GneRender(false, '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge')
    await render.init()
    await render.test()
})()

// module.exports = GneRender