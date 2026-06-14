export class LaneManager {
  private readonly lanes: (string | null)[] = [];

  // Occupies a lane for the given commit hash and returns the lane index.
  public findLaneForCommit(hash: string): number {
    const lane = this.lanes.indexOf(hash);

    if (lane !== -1) {
      // This lane (the lowest-numbered match) wins. Any other,
      // higher-numbered lanes still pointing at this same hash were
      // racing toward the same convergence point and are now dead —
      // free them so future branch tips can reuse them.
      for (let i = lane + 1; i < this.lanes.length; i++) {
        if (this.lanes[i] === hash) {
          this.lanes[i] = null;
        }
      }
      return lane;
    }

    // Reuse a freed (null) lane if one is available, otherwise
    // append a new one.
    const freeLane = this.lanes.indexOf(null);
    if (freeLane !== -1) {
      this.lanes[freeLane] = hash;
      return freeLane;
    }

    const newLane = this.lanes.length;
    this.lanes.push(hash);
    return newLane;
  }

  public next(lane: number, next: string | null): void {
    this.lanes[lane] = next;
  }

  public release(hash: string): void {
    const idx = this.lanes.indexOf(hash);
    if (idx !== -1 && idx !== 0) {
      this.lanes[idx] = null;
    }
  }

  public transfer(from: string, to: string): void {
    const idx = this.lanes.indexOf(from);
    if (idx !== -1) {
      this.lanes[idx] = to;
    }
  }

  // Returns a copy of the current lane assignments.
  public getLanes(): (string | null)[] {
    return this.lanes;
  }
}
