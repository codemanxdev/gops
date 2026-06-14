export class LaneManager {
  private readonly lanes: (string | null)[] = [];

  // Occupies a lane for the given commit hash and returns the lane index.
  public occupy(hash: string): number {
    const lane = this.lanes.indexOf(hash);

    if (lane !== -1) {
      return lane;
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