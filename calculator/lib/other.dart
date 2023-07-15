import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:math_expressions/math_expressions.dart';

void main() {
  runApp(const MainApp());
}

class MainApp extends StatefulWidget {
  const MainApp({Key? key}) : super(key: key);

  @override
  State<StatefulWidget> createState() => _MainApp();
}

class _MainApp extends State<MainApp> {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        theme: ThemeData(scaffoldBackgroundColor: Colors.tealAccent),
        debugShowCheckedModeBanner: false,
        title: 'Calculator',
        home: const HomeScreen());
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _expToCalculate = '';
  TextEditingController _controller = TextEditingController(text:'Exp here');

  static const List<String> buttonTexts = [
    '(',
    ')',
    'AC',
    '/',
    '7',
    '8',
    '9',
    '*',
    '4',
    '5',
    '6',
    '-',
    '1',
    '2',
    '3',
    '+',
    '0',
    '.',
    '',
    '='
  ];

  List<ElevatedButton> createCalculatorButtons() {
    List<ElevatedButton> buttons = [];
    for (String element in buttonTexts) {
      if (element == '') {
        buttons.add(
          ElevatedButton(
            onPressed: () {
              deleteLeft(); // Add your button's onPressed logic here
            },
            style: ElevatedButton.styleFrom(
                backgroundColor: Colors.pink, shape: const CircleBorder()),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  CupertinoIcons.delete_left,
                  color: Colors.white,
                ),
              ],
            ),
          ),
        );
      } else if (element == 'AC') {
        buttons.add(ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.pink,
              shape: const CircleBorder(),
            ),
            onPressed: () {
              reset();
            },
            child: Text(
              element,
              style: const TextStyle(
                fontSize: 22, // Specify the desired font size
                fontWeight: FontWeight.bold, // Specify the desired font weight
              ),
            )));
      } else if (element == '=') {
        buttons.add(ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.pink,
              shape: const CircleBorder(),
            ),
            onPressed: () {
              calculate();
            },
            child: Text(
              element,
              style: const TextStyle(
                fontSize: 22, // Specify the desired font size
                fontWeight: FontWeight.bold, // Specify the desired font weight
              ),
            )));
      } else {
        buttons.add(ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.pink,
              shape: const CircleBorder(),
            ),
            onPressed: () {
              addToTheExpression(element);
            },
            child: Text(
              element,
              style: const TextStyle(
                fontSize: 22, // Specify the desired font size
                fontWeight: FontWeight.bold, // Specify the desired font weight
              ),
            )));
      }
    }
    return buttons;
  }


  void reset() {
    setState(() {
      _expToCalculate = '';
      _controller.text = _expToCalculate;
    });
  }

  void deleteLeft() {
    setState(() {
      if (_expToCalculate.isNotEmpty) {
        _expToCalculate = _expToCalculate.substring(0, _expToCalculate.length - 1);
        _controller.text = _expToCalculate;
      }
    });
  }

  void calculate() {
    try {
      Parser p = Parser();
      Expression exp = p.parse(_expToCalculate);
      ContextModel cm = ContextModel();
      setState(() {
        _expToCalculate = exp.evaluate(EvaluationType.REAL, cm).toString();
        _controller.text = _expToCalculate;
      });
    } catch (e) {
      // handle exception
    }
  }

  void addToTheExpression(String s) {
    setState(() {
      _expToCalculate += s;
      _controller.text = _expToCalculate;
    });
  }

  String parse() {
    Parser parser = Parser();
    ContextModel contextModel = ContextModel();
    Expression expression =
    parser.parse(_expToCalculate); // Parse the input String
    dynamic result = expression.evaluate(EvaluationType.REAL, contextModel);
    return result.toString();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Calculator"),
        backgroundColor: Colors.pink,
      ),
      body: Column(
        children: [
          Expanded(
            flex: 2,
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.grey.shade300, Colors.grey.shade500],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Column(
                children: [
                  Expanded(
                    child: TextField(
                      readOnly: true,
                      autofocus: false,
                      showCursor: true,
                      textAlign: TextAlign.right,
                      textAlignVertical: TextAlignVertical.center, // Center text vertically
                      controller: _controller,
                      onTap: () {
                        print('I\'ve been tapped');
                      },
                    ),
                  ),
                  Expanded(
                    child: TextField(
                      autofocus: false,
                      enabled: false,
                      textAlignVertical: TextAlignVertical.center, // Center text vertically
                      controller: TextEditingController(text: 'hello'),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            flex: 2,
            child: GridView.count(
              crossAxisCount: 6,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
              padding: const EdgeInsets.all(8),
              physics: NeverScrollableScrollPhysics(),
              children: createCalculatorButtons(),
            ),
          ),
        ],
      ),
    );
  }
}
