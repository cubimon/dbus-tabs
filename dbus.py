#!/usr/bin/python3

import sys
import json
import struct
import dbus

from gi.repository import GLib
from pydbus import SessionBus

global tabs
tabs = {}

def getMessage():
  rawLength = sys.stdin.buffer.read(4)
  if len(rawLength) == 0:
    sys.exit(0)
  messageLength = struct.unpack('@I', rawLength)[0]
  message = sys.stdin.buffer.read(messageLength).decode('utf-8')
  return json.loads(message)

def encodeMessage(messageContent):
  encodedContent = json.dumps(messageContent).encode('utf-8')
  encodedLength = struct.pack('@I', len(encodedContent))
  return {'length': encodedLength, 'content': encodedContent}

def sendMessage(encodedMessage):
  sys.stdout.buffer.write(encodedMessage['length'])
  sys.stdout.buffer.write(encodedMessage['content'])
  sys.stdout.buffer.flush()

def handler(channel, sender=None):
  global tabs
  tabs = getMessage()
  return True

class BrowserTabs(object):
  """
    <node>
      <interface name='org.cubimon.BrowserTabs'>
        <method name='tabs'>
          <arg type='s' name='response' direction='out'/>
        </method>
        <method name='activate'>
          <arg type='t' name='tabId' direction='in'/>
        </method>
        <method name='rename'>
          <arg type='t' name='tabId' direction='in'/>
          <arg type='s' name='newTitle' direction='in'/>
        </method>
      </interface>
    </node>
  """

  def tabs(self):
    global tabs
    return json.dumps(tabs)

  def activate(self, tab_id):
    message = {
      'action': 'activate',
      'tabId': str(tab_id)
    }
    sendMessage(encodeMessage(message))

  def rename(self, tab_id, new_title):
    message = {
      'action': 'rename',
      'tabId': str(tab_id),
      'newTitle': new_title
    }
    sendMessage(encodeMessage(message))

#sys.stdin = sys.stdin.detach()
#sys.stdout = sys.stdout.detach()
loop = GLib.MainLoop()
channel = GLib.IOChannel.unix_new(sys.stdin.fileno())
GLib.io_add_watch(channel, GLib.IOCondition.IN, handler)
GLib.io_add_watch(channel, GLib.IOCondition.HUP, lambda *_: loop.quit())
bus = SessionBus()
pub = bus.publish('org.cubimon.BrowserTabs', BrowserTabs())
loop.run()
