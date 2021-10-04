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