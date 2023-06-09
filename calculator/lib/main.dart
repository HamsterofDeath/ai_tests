// code 1
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:math_expressions/math_expressions.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Calculator',
      theme: ThemeData(
        primarySwatch: Colors.deepPurple,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: const MyHomePage(title: 'Flutter Calculator'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({Key? key, required this.title}) : super(key: key);

  final String title;

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  String _expression = '';
  String _result = '';

  // Create TextEditingController for the expression field
  TextEditingController _expressionController = TextEditingController();

  void _onButtonPress(String buttonText) {
    setState(() {
      if (buttonText == 'C') {
        _expression = '';
        _result = '';
        _expressionController.text =
            _expression; // Update the controller's text
        _expressionController.selection = TextSelection.collapsed(offset: 0);
      } else {
        // Handle the cursor position
        int cursorPosition = _expressionController.selection.start;

        // Check if the cursor position is valid
        if (cursorPosition < 0 ||
            cursorPosition > _expressionController.text.length) {
          cursorPosition = _expressionController.text.length;
        }

        // Insert the character at the cursor position
        final newText = _expressionController.text
            .replaceRange(cursorPosition, cursorPosition, buttonText);
        _expressionController.text = newText;
        _expressionController.selection =
            TextSelection.collapsed(offset: cursorPosition + buttonText.length);
        _expression =
            _expressionController.text; // Update the _expression variable
      }
      try {
        _calculateResult();
      } catch (e) {
        _result = "Error";
      }
    });
  }

  void _calculateResult() {
    Parser p = Parser();
    Expression exp = p.parse(_expression);
    ContextModel cm = ContextModel();
    double eval = exp.evaluate(EvaluationType.REAL, cm);
    _result = eval.toString();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.grey[900],
        title: Text(
          widget.title,
          style: TextStyle(
            fontFamily: 'SciFiFont', // Use your custom sci-fi font here
          ),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 10),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(
                  color: Colors.black,
                  width: 2.0,
                ),
              ),
              child: TextField(
                readOnly: false,
                showCursor: true,
                controller: _expressionController,
                textAlign: TextAlign.right,
                inputFormatters: [
                  FilteringTextInputFormatter.allow(RegExp(r'[0-9().+\-*/]'))
                ],
                style: TextStyle(fontSize: 24, fontFamily: 'SciFiFont'),
                decoration: InputDecoration(
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.zero,
                ),
                maxLines: 1,
                onChanged: (text) {
                  _expression = text;
                  _onButtonPress("");
                },
              ),
            ),
          ),
          Expanded(
            child: Container(
              padding: EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(
                  color: Colors.black,
                  width: 2.0,
                ),
              ),
              child: TextField(
                readOnly: true,
                controller: TextEditingController(text: _result),
                textAlign: TextAlign.right,
                style: TextStyle(fontSize: 24, color: Colors.grey, fontFamily: 'SciFiFont'),
                decoration: InputDecoration(
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.zero,
                ),
                maxLines: 1,
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: GridView.count(
              crossAxisCount: 4,
              childAspectRatio: 1.2,
              children: <Widget>[
                _buildButton('7'),
                _buildButton('8'),
                _buildButton('9'),
                _buildButton('/'),
                _buildButton('4'),
                _buildButton('5'),
                _buildButton('6'),
                _buildButton('*'),
                _buildButton('1'),
                _buildButton('2'),
                _buildButton('3'),
                _buildButton('-'),
                _buildButton('.'),
                _buildButton('0'),
                _buildButton('C'),
                _buildButton('+'),
                _buildButton('('),
                _buildButton(')'),
                _buildButton('.'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildButton(String buttonText) {
    return Container(
      margin: EdgeInsets.all(10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        gradient: LinearGradient(
          colors: [Colors.blue, Colors.purple],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: TextButton(
        onPressed: () => _onButtonPress(buttonText),
        child: Text(
          buttonText,
          style: TextStyle(
            fontSize: 20,
            color: Colors.white,
            fontFamily: 'SciFiFont',
          ),
        ),
      ),
    );
  }
}
