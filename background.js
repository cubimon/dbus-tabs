let tabsCache = {}

// tab created
browser.tabs.onCreated.addListener((tab) => {
  tabsCache[tab.id] = tab.title
  nativePort.postMessage(tabsCache)
})

// tab removed
browser.tabs.onRemoved.addListener((tabId) => {
  delete tabsCache[tabId]
  nativePort.postMessage(tabsCache)
})

// activate/focus tab
function activate(tabId) {
  browser.tabs.update(parseInt(tabId), {active: true}, (tab) => {
    browser.windows.update(tab.windowId, {focused: true})
  })
}

// native interface
let nativePort = browser.runtime.connectNative('dbus_tabs')
nativePort.onMessage.addListener(message => {
  switch(message.action) {
    case 'activate':
      activate(message.tabId)
      break
  }
})

// initialize tabs cache
browser.tabs.query({}).then(tabs => {
  for (let tab of tabs) {
    tabsCache[tab.id] = tab.title
  }
  nativePort.postMessage(tabsCache)
})
