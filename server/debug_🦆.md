# Debug duck area

> this is a text file where I put assorted ideas I have so that I do not forget if I go on a break

## Ramble

### General structure

previous versions of my VOD websites like [bruh](https://github.com/ffamilyfriendly/bruh) and [armadillo](https://github.com/ffamilyfriendly/armadillo) have had folders (categories) which houses the entities (movies, audiobooks). This feels very "structured" in theory. However, in reality it was quite shit as someone who wanted to watch starwars for example would have to navigate movies -> sci-fi -> starwars -> Starwars the peepee awakens (actual thing user was looking for).

When you look at the data structures of entities in this repo it's clear that was my intention here too. However, fuck that. On the homepage we can sort with tags instead using some sort of _algorithm_ and defer finding anything not prominently shown on the front page to a search bar. With a section for "continue watching" this should be quite easy

### Series structure

so I have often had issues with structuring series but I think I have a winning concept (which also happens to just be the sanest concept).
Series could be divided into Series -> Season -> SeriesEpisode
With these 3 distinct entity types it _should_ be relativly easy to make sure a user who has selected a series can watch the episodes one after one

## needs doing

- [ ] fix serialization of entity.entity_type. For some reason it serializes as a string when I'd rather it serializes as number
- [ ] add more search options to get_collections
- [ ] add support for tagging entities
  - [x] on backend manager
  - [ ] as API routes
- [x] make tmdb automatically add tags (if not exist) for genres / their tagging system
- [ ] add get_collections support for tags
- [ ] add playback support for normal mp4 files
