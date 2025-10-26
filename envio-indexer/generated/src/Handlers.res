  @genType
module MovieManager = {
  module MovieAdded = Types.MakeRegister(Types.MovieManager.MovieAdded)
  module ShowAdded = Types.MakeRegister(Types.MovieManager.ShowAdded)
}

  @genType
module TicketEscrow = {
  module RefundProcessed = Types.MakeRegister(Types.TicketEscrow.RefundProcessed)
  module TicketPurchased = Types.MakeRegister(Types.TicketEscrow.TicketPurchased)
}

@genType /** Register a Block Handler. It'll be called for every block by default. */
let onBlock: (
  Envio.onBlockOptions<Types.chain>,
  Envio.onBlockArgs<Types.handlerContext> => promise<unit>,
) => unit = (
  EventRegister.onBlock: (unknown, Internal.onBlockArgs => promise<unit>) => unit
)->Utils.magic
