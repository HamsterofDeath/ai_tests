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
      appBar: AppBar(
        title: Text(widget.title),
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
                  // readOnly attribute set to false to allow showing cursor
                  readOnly: false,
                  // showCursor attribute set to true to display the cursor
                  showCursor: true,
                  controller: _expressionController,
                  textAlign: TextAlign.right,
                  // Input formatter to allow only digits, parentheses, and arithmetic operators
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(RegExp(r'[0-9().+\-*/]'))
                  ],
                  style: TextStyle(fontSize: 24),
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.zero,
                  ),
                  maxLines: 1,
                  onChanged: (text) {
                    _expression = text;
                    _onButtonPress("");
                  }),
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
                style: TextStyle(fontSize: 24, color: Colors.grey),
                decoration: InputDecoration(
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.zero,
                ),
                maxLines: 1,
              ),
            ),
          ),
          Divider(height: 1),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildButton('7'),
              _buildButton('8'),
              _buildButton('9'),
              _buildButton('/'),
            ],
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildButton('4'),
              _buildButton('5'),
              _buildButton('6'),
              _buildButton('*'),
            ],
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildButton('1'),
              _buildButton('2'),
              _buildButton('3'),
              _buildButton('-'),
            ],
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildButton('.'),
              _buildButton('0'),
              _buildButton('C'),
              _buildButton('+'),
            ],
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildButton('('),
              _buildButton(')'),
              _buildButton('.'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildButton(String buttonText) {
    return Expanded(
      child: Container(
        width: double.infinity,
        margin: EdgeInsets.all(10),
        decoration: BoxDecoration(
          shape: BoxShape.circle, // Circular shape
          color: Colors.pink,
        ),
        child: Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle, // Circular shape
            color: Colors.pink,
          ),
          padding: EdgeInsets.all(20),
          // Adjust padding to increase the size of the button
          child: Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle, // Circular shape
              color: Colors.pink,
            ),
            padding: EdgeInsets.all(30),
            // Adjust padding to increase the size of the button
            child: TextButton(
              onPressed: () => _onButtonPress(buttonText),
              child: Text(
                buttonText,
                style: TextStyle(
                  fontSize: 48,
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
