import java.awt.event.{ActionEvent, ActionListener}
import java.awt.image.BufferedImage
import java.awt.{BorderLayout, Color, Graphics2D}
import javax.swing.{ImageIcon, JFrame, JLabel, JPanel, SwingUtilities, Timer, WindowConstants}

// Define the directions
sealed trait Direction
case object Up extends Direction
case object Down extends Direction
case object Left extends Direction
case object Right extends Direction

// Define the position
class Position(var x: Int, var y: Int)

class Player(var position: Position, var direction: Direction) {
  def move(): Unit = direction match {
    case Up => position.y -= 1
    case Down => position.y += 1
    case Left => position.x -= 1
    case Right => position.x += 1
  }

  def turnLeft(): Unit = direction match {
    case Up => direction = Left
    case Down => direction = Right
    case Left => direction = Down
    case Right => direction = Up
  }

  def turnRight(): Unit = direction match {
    case Up => direction = Right
    case Down => direction = Left
    case Left => direction = Up
    case Right => direction = Down
  }
}


sealed trait Move {
  def doIt(player: Player, field: GameField):Unit
}
case object TurnLeft extends Move {
  override def doIt(player: Player, field: GameField): Unit = player.turnLeft()
}
case object TurnRight extends Move{
  override def doIt(player: Player, field: GameField): Unit = player.turnRight()
}

case object MoveForward extends Move {
  override def doIt(player: Player, field: GameField): Unit = {
    val isFreeAndInside = player.direction match {
      case Up    => player.position.y > 0 && field.grid(player.position.y - 1)(player.position.x) == 0
      case Down  => player.position.y < field.grid.length - 1 && field.grid(player.position.y + 1)(player.position.x) == 0
      case Left  => player.position.x > 0 && field.grid(player.position.y)(player.position.x - 1) == 0
      case Right => player.position.x < field.grid(0).length - 1 && field.grid(player.position.y)(player.position.x + 1) == 0
    }

    if (isFreeAndInside) player.move()
  }
}


case object PlaceBlock extends Move{
  override def doIt(player: Player, field: GameField): Unit = field.placeBlock(player)
}

case object RemoveBlock extends Move{
  override def doIt(player: Player, field: GameField): Unit = field.removeBlock(player)
}

case object Idle extends Move {
  override def doIt(player: Player, field: GameField): Unit = {}
}

class GameField(val grid: Array[Array[Int]])  {


  def scan(player: Player): Int = {
    // return distance to the next block or the end of the field
    player.direction match {
      case Up =>
        (0 until player.position.y).findLast(y => grid(y)(player.position.x) == 1)
          .map(blockY => player.position.y - blockY - 1).getOrElse(player.position.y)

      case Down =>
        (player.position.y until grid.length).find(y => grid(y)(player.position.x) == 1)
          .map(blockY => blockY - player.position.y - 1).getOrElse(grid.length - player.position.y - 1)

      case Left =>
        (0 until player.position.x).findLast(x => grid(player.position.y)(x) == 1)
          .map(blockX => player.position.x - blockX - 1).getOrElse(player.position.x)

      case Right =>
        (player.position.x until grid(0).length).find(x => grid(player.position.y)(x) == 1)
          .map(blockX => blockX - player.position.x - 1).getOrElse(grid(0).length - player.position.x - 1)
    }
  }
  def placeBlock(player: Player): Unit = {
    // Implement logic to place a block in the grid in front of the player's location
    player.direction match {
      case Up if player.position.y > 0 => grid(player.position.y - 1)(player.position.x) = 1
      case Down if player.position.y < grid.length - 1 => grid(player.position.y + 1)(player.position.x) = 1
      case Left if player.position.x > 0 => grid(player.position.y)(player.position.x - 1) = 1
      case Right if player.position.x < grid(0).length - 1 => grid(player.position.y)(player.position.x + 1) = 1
      case _ =>
    }
  }

  def removeBlock(player: Player): Unit = {
    // Implement logic to remove a block from the grid in front of the player's location
    player.direction match {
      case Up if player.position.y > 0 && grid(player.position.y - 1)(player.position.x) == 1 => grid(player.position.y - 1)(player.position.x) = 0
      case Down if player.position.y < grid.length - 1 && grid(player.position.y + 1)(player.position.x) == 1 => grid(player.position.y + 1)(player.position.x) = 0
      case Left if player.position.x > 0 && grid(player.position.y)(player.position.x - 1) == 1 => grid(player.position.y)(player.position.x - 1) = 0
      case Right if player.position.x < grid(0).length - 1 && grid(player.position.y)(player.position.x + 1) == 1 => grid(player.position.y)(player.position.x + 1) = 0
      case _ =>
    }
  }
}

object SmaBot {
  private val gridSize = 20
  private val gameField = new GameField(Array.fill(gridSize,gridSize)(0))
  private val player = new Player(Position(0, 0), Up)
  private val blockSize = 20

  private val frame: JFrame = new JFrame("SmaBot")
  private val label: JLabel = new JLabel()

  private def renderGrid(grid: Array[Array[Int]]): BufferedImage = {
    val image = new BufferedImage(gridSize * blockSize, gridSize * blockSize, BufferedImage.TYPE_INT_RGB)
    val g = image.createGraphics()

    // Draw the blocks
    for (y <- grid.indices; x <- grid(y).indices) {
      g.setColor(if (grid(y)(x) == 1) Color.WHITE else Color.BLACK)
      g.fillRect(x * blockSize, y * blockSize, blockSize, blockSize)
    }

    // Draw the grid lines
    g.setColor(Color.GRAY)
    for (x <- 0 until gridSize) {
      g.drawLine(x * blockSize, 0, x * blockSize, gridSize * blockSize)
    }
    for (y <- 0 until gridSize) {
      g.drawLine(0, y * blockSize, gridSize * blockSize, y * blockSize)
    }

    // Draw the player
    g.setColor(Color.RED)
    g.fillOval(player.position.x * blockSize, player.position.y * blockSize, blockSize, blockSize)

    // Draw the player direction
    g.setColor(Color.YELLOW)
    player.direction match {
      case Up => g.fillOval(player.position.x * blockSize + blockSize / 2 - blockSize / 8,
        player.position.y * blockSize, blockSize / 4, blockSize / 4)
      case Down => g.fillOval(player.position.x * blockSize + blockSize / 2 - blockSize / 8,
        player.position.y * blockSize + 3 * blockSize / 4, blockSize / 4, blockSize / 4)
      case Left => g.fillOval(player.position.x * blockSize,
        player.position.y * blockSize + blockSize / 2 - blockSize / 8, blockSize / 4, blockSize / 4)
      case Right => g.fillOval(player.position.x * blockSize + 3 * blockSize / 4,
        player.position.y * blockSize + blockSize / 2 - blockSize / 8, blockSize / 4, blockSize / 4)
    }

    g.dispose()

    image
  }

  private val timer = new Timer(1000, new ActionListener() {
    def actionPerformed(e: ActionEvent): Unit = {
      Logic.getNextAction(gameField.scan(player)).doIt(player, gameField)
      label.setIcon(new ImageIcon(renderGrid(gameField.grid)))
    }
  })

  def main(args: Array[String]): Unit = {
    SwingUtilities.invokeLater(new Runnable {
      def run(): Unit = {
        label.setIcon(new ImageIcon(renderGrid(gameField.grid)))
        frame.getContentPane.add(label, BorderLayout.CENTER)
        frame.pack()
        frame.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE)
        frame.setVisible(true)

        timer.start()
      }
    })
  }
}

object Logic {

  def getNextAction(distanceToNextBlock:Int) = {
    TurnLeft
  }
}
