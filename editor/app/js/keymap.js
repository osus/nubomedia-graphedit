// Shortcuts keymap

export function keymap() {
  return {
    NuboEditor: {
      CUT: {
        osx: 'command+x',
        windows: 'ctrl+x',
        linux: 'ctrl+x'
      },
      COPY: {
        osx: 'command+c',
        windows: 'ctrl+c',
        linux: 'ctrl+c'
      },
      PASTE: {
        osx: 'command+v',
        windows: 'ctrl+v',
        linux: 'ctrl+v'
      },
      DELETE: {
        osx: 'command+backspace',
        windows: 'delete',
        linux: 'delete'
      }
    }
  }
}