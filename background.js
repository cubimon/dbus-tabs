let tabsCache = {}
let activeTabId = -1

// tab created
browser.tabs.onCreated.addListener(tab => {
  tabsCache[tab.id] = tab.title
  nativePort.postMessage({
    tabs: tabsCache
  })
})

// tab removed
browser.tabs.onRemoved.addListener(tabId => {
  delete tabsCache[tabId]
  nativePort.postMessage({
    tabs: tabsCache
  })
})

// tab updated
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if ('title' in changeInfo) {
    tabsCache[tabId] = changeInfo.title
    nativePort.postMessage({
      tabs: tabsCache
    })
  }
  browser.sessions.getTabValue(tabId, 'customTitle').then(customTitle => {
    if (customTitle) {
      // apply custom title
      browser.tabs.executeScript(tabId, {
        code: `document.title = '${customTitle}'`
      })
    } else {
      // custom title doesn't exist
      browser.sessions.removeTabValue(tabId, 'oldTitle')
    }
  })
})

// tab activated
browser.tabs.onActivated.addListener((activeInfo) => {
  activeTabId = activeInfo.tabId
  nativePort.postMessage({
    activeTabId: activeTabId
  })
})

// activate/focus tab
function activate(tabId) {
  browser.tabs.update(tabId, {active: true}, tab => {
    browser.windows.update(tab.windowId, {focused: true})
  })
}

// rename tab
function rename(tabId, newTitle) {
  if (newTitle == '') {
    // restore old title
    browser.sessions.removeTabValue(tabId, 'customTitle')
    browser.sessions.getTabValue(tabId, 'oldTitle').then(oldTitle => {
      if (oldTitle) {
        // apply old title
        browser.tabs.executeScript(tabId, {
          code: `document.title = '${oldTitle}'`
        })
        browser.sessions.removeTabValue(tabId, 'oldTitle')
      }
    })
  } else {
    // save old title and apply new title
    browser.tabs.get(tabId).then(tabInfo => {
      browser.sessions.getTabValue(tabId, 'oldTitle').then(oldTitle => {
        if (!oldTitle) {
          browser.sessions.setTabValue(tabId, 'oldTitle', tabInfo.title)
        }
      })
      browser.sessions.setTabValue(tabId, 'customTitle', newTitle)
      browser.tabs.executeScript(tabId, {
        code: `document.title = '${newTitle}'`
      })
    })
  }
}

// native interface
let nativePort = browser.runtime.connectNative('dbus_tabs')
nativePort.onMessage.addListener(message => {
  switch(message.action) {
    case 'activate':
      activate(parseInt(message.tabId))
      break
    case 'rename':
      rename(parseInt(message.tabId), message.newTitle)
      break
  }
})

// initialize tabs cache
browser.tabs.query({}).then(tabs => {
  for (let tab of tabs) {
    tabsCache[tab.id] = tab.title
  }
  nativePort.postMessage({
    tabs: tabsCache
  })
})
activeTabId = browser.tabs.getCurrent().tabId
nativePort.postMessage({
  activeTabId: activeTabId
})
