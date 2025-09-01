import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    username: String!
    firstName: String
    lastName: String
    avatar: String
    bio: String
    country: String
    role: String!
    isVerified: Boolean!
    isActive: Boolean!
    lastLogin: String
    socialLinks: SocialLinks
    createdAt: String!
    updatedAt: String!
  }

  type SocialLinks {
    website: String
    instagram: String
    twitter: String
    youtube: String
  }

  type Beat {
    id: ID!
    title: String!
    description: String
    producer: String!
    producerId: String!
    artwork: String
    audioFile: String!
    bpm: Int!
    musicalKey: String!
    genre: String!
    tags: [String!]!
    price: Float!
    salePrice: Float
    isExclusive: Boolean!
    isPublished: Boolean!
    isDraft: Boolean!
    licenseTypes: LicenseTypes!
    stats: BeatStats!
    metadata: BeatMetadata!
    createdAt: String!
    updatedAt: String!
  }

  type LicenseTypes {
    free: Boolean!
    mp3: Boolean!
    wav: Boolean!
    stems: Boolean!
    exclusive: Boolean!
  }

  type BeatStats {
    plays: Int!
    likes: Int!
    downloads: Int!
    shares: Int!
  }

  type BeatMetadata {
    duration: Float!
    fileSize: Int!
    format: String!
    sampleRate: Int!
    bitRate: Int!
  }

  type Playlist {
    id: ID!
    title: String!
    description: String
    coverImage: String
    isPublic: Boolean!
    curator: String!
    curatorId: String!
    beats: [String!]!
    tags: [String!]!
    stats: PlaylistStats!
    createdAt: String!
    updatedAt: String!
  }

  type PlaylistStats {
    plays: Int!
    likes: Int!
    shares: Int!
  }

  type AuthResponse {
    user: User!
    accessToken: String!
    refreshToken: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input RegisterInput {
    email: String!
    username: String!
    password: String!
    firstName: String
    lastName: String
    country: String
  }

  input BeatInput {
    title: String!
    description: String
    bpm: Int!
    musicalKey: String!
    genre: String!
    tags: [String!]!
    price: Float!
    salePrice: Float
    isExclusive: Boolean!
    licenseTypes: LicenseTypesInput!
  }

  input LicenseTypesInput {
    free: Boolean!
    mp3: Boolean!
    wav: Boolean!
    stems: Boolean!
    exclusive: Boolean!
  }

  input PlaylistInput {
    title: String!
    description: String
    coverImage: String
    isPublic: Boolean!
    tags: [String!]!
  }

  type Query {
    # User queries
    me: User
    user(id: ID!): User
    users(search: String, limit: Int, offset: Int): [User!]!
    topProducers(limit: Int): [User!]!
    
    # Beat queries
    beats(search: String, genre: String, bpm: Int, limit: Int, offset: Int): [Beat!]!
    beat(id: ID!): Beat
    beatsByProducer(producerId: ID!, limit: Int, offset: Int): [Beat!]!
    featuredBeats(limit: Int): [Beat!]!
    trendingBeats(limit: Int): [Beat!]!
    
    # Playlist queries
    playlists(search: String, limit: Int, offset: Int): [Playlist!]!
    playlist(id: ID!): Playlist
    userPlaylists(userId: ID!, isPublic: Boolean): [Playlist!]!
    featuredPlaylists(limit: Int): [Playlist!]!
    trendingPlaylists(limit: Int): [Playlist!]!
  }

  type Mutation {
    # Auth mutations
    login(input: LoginInput!): AuthResponse!
    register(input: RegisterInput!): AuthResponse!
    refreshToken(refreshToken: String!): AuthResponse!
    logout: Boolean!
    
    # User mutations
    updateProfile(input: UserInput!): User!
    followUser(userId: ID!): Boolean!
    unfollowUser(userId: ID!): Boolean!
    
    # Beat mutations
    createBeat(input: BeatInput!): Beat!
    updateBeat(id: ID!, input: BeatInput!): Beat!
    deleteBeat(id: ID!): Boolean!
    likeBeat(id: ID!): Boolean!
    unlikeBeat(id: ID!): Boolean!
    
    # Playlist mutations
    createPlaylist(input: PlaylistInput!): Playlist!
    updatePlaylist(id: ID!, input: PlaylistInput!): Playlist!
    deletePlaylist(id: ID!): Boolean!
    addTrackToPlaylist(playlistId: ID!, beatId: ID!): Boolean!
    removeTrackFromPlaylist(playlistId: ID!, beatId: ID!): Boolean!
    likePlaylist(id: ID!): Boolean!
    unlikePlaylist(id: ID!): Boolean!
  }

  input UserInput {
    firstName: String
    lastName: String
    bio: String
    country: String
    socialLinks: SocialLinksInput
  }

  input SocialLinksInput {
    website: String
    instagram: String
    twitter: String
    youtube: String
  }
`;
