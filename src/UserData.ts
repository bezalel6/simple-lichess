interface Chess960 {
    games: number;
    rating: number;
    rd: number;
    prog: number;
    prov: boolean;
}

interface Atomic {
    games: number;
    rating: number;
    rd: number;
    prog: number;
    prov: boolean;
}

interface RacingKings {
    games: number;
    rating: number;
    rd: number;
    prog: number;
    prov: boolean;
}

interface UltraBullet {
    games: number;
    rating: number;
    rd: number;
    prog: number;
    prov: boolean;
}

interface Blitz {
    games: number;
    rating: number;
    rd: number;
    prog: number;
    prov: boolean;
}

interface KingOfTheHill {
    games: number;
    rating: number;
    rd: number;
    prog: number;
    prov: boolean;
}

interface Bullet {
    games: number;
    rating: number;
    rd: number;
    prog: number;
    prov: boolean;
}

interface Correspondence {
    games: number;
    rating: number;
    rd: number;
    prog: number;
    prov: boolean;
}

interface Horde {
    games: number;
    rating: number;
    rd: number;
    prog: number;
    prov: boolean;
}

interface Puzzle {
    games: number;
    rating: number;
    rd: number;
    prog: number;
    prov: boolean;
}

interface Classical {
    games: number;
    rating: number;
    rd: number;
    prog: number;
    prov: boolean;
}

interface Rapid {
    games: number;
    rating: number;
    rd: number;
    prog: number;
    prov: boolean;
}

interface Storm {
    runs: number;
    score: number;
}

interface Perfs {
    chess960: Chess960;
    atomic: Atomic;
    racingKings: RacingKings;
    ultraBullet: UltraBullet;
    blitz: Blitz;
    kingOfTheHill: KingOfTheHill;
    bullet: Bullet;
    correspondence: Correspondence;
    horde: Horde;
    puzzle: Puzzle;
    classical: Classical;
    rapid: Rapid;
    storm: Storm;
}

interface Profile {
    country: string;
    location: string;
    bio: string;
    firstName: string;
    lastName: string;
    fideRating: number;
    uscfRating: number;
    ecfRating: number;
    links: string;
}

interface PlayTime {
    total: number;
    tv: number;
}

interface Count {
    all: number;
    rated: number;
    ai: number;
    draw: number;
    drawH: number;
    loss: number;
    lossH: number;
    win: number;
    winH: number;
    bookmark: number;
    playing: number;
    import: number;
    me: number;
}

interface UserInfo {
    id: string;
    username: string;
    online: boolean;
    perfs: Perfs;
    createdAt: number;
    disabled: boolean;
    tosViolation: boolean;
    profile: Profile;
    seenAt: number;
    patron: boolean;
    verified: boolean;
    playTime: PlayTime;
    title: string;
    url: string;
    playing: string;
    completionRate: number;
    count: Count;
    streaming: boolean;
    followable: boolean;
    following: boolean;
    blocking: boolean;
    followsYou: boolean;
}
export default UserInfo;
export {
    Chess960,
    Atomic,
    RacingKings,
    UltraBullet,
    Blitz,
    KingOfTheHill,
    Bullet,
    Correspondence,
    Horde,
    Puzzle,
    Classical,
    Rapid,
    Storm,
    Perfs,
    Profile,
    PlayTime,
    Count,
};