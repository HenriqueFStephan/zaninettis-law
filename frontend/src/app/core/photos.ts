const photos = {
  'home.phFacade': 'assets/photos/facade.jpg',
  'home.phRoom': 'assets/photos/room.jpg',
  'home.phPages': 'assets/photos/pages.jpg',
  'home.phLibrary': 'assets/photos/library.jpg',
  'home.phCity': 'assets/photos/city.jpg',
} as const;

type PhotoKey = keyof typeof photos;

export function photoFor(key: string): string {
  return photos[key as PhotoKey] ?? photos['home.phFacade'];
}
