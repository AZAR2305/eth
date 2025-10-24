import assert from "assert";
import { 
  TestHelpers,
  MovieManager_MovieAdded
} from "generated";
const { MockDb, MovieManager } = TestHelpers;

describe("MovieManager contract MovieAdded event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for MovieManager contract MovieAdded event
  const event = MovieManager.MovieAdded.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("MovieManager_MovieAdded is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await MovieManager.MovieAdded.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualMovieManagerMovieAdded = mockDbUpdated.entities.MovieManager_MovieAdded.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedMovieManagerMovieAdded: MovieManager_MovieAdded = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      movieId: event.params.movieId,
      title: event.params.title,
      owner: event.params.owner,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualMovieManagerMovieAdded, expectedMovieManagerMovieAdded, "Actual MovieManagerMovieAdded should be the same as the expectedMovieManagerMovieAdded");
  });
});
