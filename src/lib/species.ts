export const SPECIES_LIST = [
  'Cane', 'Gatto', 'Coniglio', 'Criceto', 'Topo', 'Ratto',
  'Cavia', 'Furretto', 'Pappagallo', 'Canarino', 'Tartaruga',
  'Serpente', 'Iguana', 'Pesce', 'Cavallo', 'Capra', 'Pecora',
]

export const BREEDS_BY_SPECIES: Record<string, string[]> = {
  'Cane': [
    'Labrador Retriever', 'Pastore Tedesco', 'Golden Retriever', 'Bulldog Francese',
    'Barboncino', 'Beagle', 'Rottweiler', 'Boxer', 'Chihuahua', 'Husky Siberiano',
    'Maltese', 'Yorkshire Terrier', 'Shih Tzu', 'Dalmata', 'Setter Irlandese',
    'Border Collie', 'Bracco Italiano', 'Volpino di Pomerania', 'Pitbull', 'Meticcio',
  ],
  'Gatto': [
    'Europeo Comune', 'Maine Coon', 'Persiano', 'Siamese', 'Bengala',
    'Ragdoll', 'Sphynx', 'British Shorthair', 'Scottish Fold', 'Abissino',
    'Certosino', 'Norvegese delle Foreste', 'Burmese', 'Orientale', 'Meticcio',
  ],
  'Coniglio': ['Ariete', 'Nano', 'Angora', 'Rex', 'Lop', 'Gigante Fiammingo', 'Lionhead'],
  'Pappagallo': ['Cocorita', 'Cacatua', 'Ara', 'Inseparabile', 'Caique', 'Lorichetto', 'Pappagallo Grigio Africano'],
}

export const EXPENSE_CATEGORIES = [
  { value: 'vet', label: 'Veterinario' },
  { value: 'food', label: 'Cibo' },
  { value: 'grooming', label: 'Toelettatura' },
  { value: 'toys', label: 'Giochi e accessori' },
  { value: 'medicine', label: 'Farmaci' },
  { value: 'other', label: 'Altro' },
] as const
