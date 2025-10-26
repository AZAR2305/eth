/**
 * Envio GraphQL Client
 * Queries indexed blockchain events from Envio indexer
 */

const ENVIO_URL = process.env.NEXT_PUBLIC_ENVIO_GRAPHQL_URL || 'http://localhost:8080/v1/graphql';

export async function queryEnvio<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
  try {
    const response = await fetch(ENVIO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`Envio query failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data;
  } catch (error) {
    console.error('❌ Envio query error:', error);
    throw error;
  }
}

export async function getMoviesByOwner(ownerAddress: string) {
  const query = `
    query GetMoviesByOwner($owner: String!) {
      MovieManager_MovieAdded(
        where: { owner: { _eq: $owner } }
        order_by: { movieId: desc }
      ) {
        id
        movieId
        title
        owner
      }
    }
  `;

  return queryEnvio<{
    MovieManager_MovieAdded: Array<{
      id: string;
      movieId: string;
      title: string;
      owner: string;
    }>;
  }>(query, { owner: ownerAddress.toLowerCase() });
}

/**
 * Get all shows for specific movies
 */
export async function getShowsByMovies(movieIds: string[]) {
  const query = `
    query GetShowsByMovies($movieIds: [numeric!]!) {
      MovieManager_ShowAdded(
        where: { movieId: { _in: $movieIds } }
        order_by: { showtime: desc }
      ) {
        id
        showId
        movieId
        showtime
        ticketPrice
      }
    }
  `;

  return queryEnvio<{
    MovieManager_ShowAdded: Array<{
      id: string;
      showId: string;
      movieId: string;
      showtime: string;
      ticketPrice: string;
    }>;
  }>(query, { movieIds });
}

export async function getPurchasesByShow(showId: string) {
  const query = `
    query GetPurchasesByShow($showId: numeric!) {
      TicketEscrow_TicketPurchased(
        where: { showId: { _eq: $showId } }
        order_by: { purchaseId: desc }
      ) {
        id
        purchaseId
        showId
        buyer
        amount
        seatNumbers
      }
    }
  `;

  return queryEnvio<{
    TicketEscrow_TicketPurchased: Array<{
      id: string;
      purchaseId: string;
      showId: string;
      buyer: string;
      amount: string;
      seatNumbers: string[];
    }>;
  }>(query, { showId });
}

/**
 * Get all ticket purchases by a specific buyer
 */
export async function getPurchasesByBuyer(buyerAddress: string) {
  const query = `
    query GetPurchasesByBuyer($buyer: String!) {
      TicketEscrow_TicketPurchased(
        where: { buyer: { _eq: $buyer } }
        order_by: { purchaseId: desc }
      ) {
        id
        purchaseId
        showId
        buyer
        amount
        seatNumbers
      }
    }
  `;

  return queryEnvio<{
    TicketEscrow_TicketPurchased: Array<{
      id: string;
      purchaseId: string;
      showId: string;
      buyer: string;
      amount: string;
      seatNumbers: string[];
    }>;
  }>(query, { buyer: buyerAddress.toLowerCase() });
}

/**
 * Get refund events for specific purchases
 */
export async function getRefunds(purchaseIds?: string[]) {
  const whereClause = purchaseIds 
    ? `where: { purchaseId: { _in: $purchaseIds } }`
    : '';

  const query = `
    query GetRefunds${purchaseIds ? '($purchaseIds: [numeric!]!)' : ''} {
      TicketEscrow_RefundProcessed(
        ${whereClause}
        order_by: { purchaseId: desc }
      ) {
        id
        purchaseId
        buyer
        customerAmount
        theaterOwnerAmount
      }
    }
  `;

  return queryEnvio<{
    TicketEscrow_RefundProcessed: Array<{
      id: string;
      purchaseId: string;
      buyer: string;
      customerAmount: string;
      theaterOwnerAmount: string;
    }>;
  }>(query, purchaseIds ? { purchaseIds } : undefined);
}

/**
 * Get analytics data for theater owner (all their movies and shows)
 */
export async function getTheaterAnalytics(ownerAddress: string) {
  const query = `
    query GetTheaterAnalytics($owner: String!) {
      movies: MovieManager_MovieAdded(
        where: { owner: { _ilike: $owner } }
        order_by: { movieId: desc }
      ) {
        id
        movieId
        title
        owner
      }
      
      purchases: TicketEscrow_TicketPurchased(
        order_by: { purchaseId: desc }
      ) {
        id
        purchaseId
        showId
        buyer
        amount
        seatNumbers
      }
      
      refunds: TicketEscrow_RefundProcessed(
        order_by: { purchaseId: desc }
      ) {
        id
        purchaseId
        buyer
        customerAmount
        theaterOwnerAmount
      }
    }
  `;

  return queryEnvio<{
    movies: Array<{
      id: string;
      movieId: string;
      title: string;
      owner: string;
    }>;
    purchases: Array<{
      id: string;
      purchaseId: string;
      showId: string;
      buyer: string;
      amount: string;
      seatNumbers: string[];
    }>;
    refunds: Array<{
      id: string;
      purchaseId: string;
      buyer: string;
      customerAmount: string;
      theaterOwnerAmount: string;
    }>;
  }>(query, { owner: ownerAddress });
}
