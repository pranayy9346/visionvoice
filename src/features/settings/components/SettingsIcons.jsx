function buildIcon(path) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d={path} />
    </svg>
  )
}

export const SETTINGS_ICONS = {
  personalization: buildIcon('M12 3l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9L9.5 8 12 3z'),
  account: buildIcon('M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-7 2-7 5v1h14v-1c0-3-3-5-7-5z'),
  history: buildIcon('M12 8v5l3 2M21 12a9 9 0 11-3-6.7'),
  accessibility: buildIcon('M12 5a2 2 0 100-4 2 2 0 000 4zm7 4H5m7 0v11m-4 0l4-6 4 6'),
  notifications: buildIcon('M15 17H5l1.4-1.4A2 2 0 007 14.2V11a5 5 0 1110 0v3.2c0 .5.2 1 .6 1.4L19 17h-4m0 0a3 3 0 01-6 0'),
  privacy: buildIcon('M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6l7-3z'),
}
