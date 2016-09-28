# mips-parser
[MIPS Assembly](https://en.wikipedia.org/wiki/MIPS_instruction_set) parser in JavaScript

**MIPS** is a reduced instruction set computer _(RISC)_ instruction set architecture developed by MIPS Technologies (formerly MIPS Computer Systems, Inc.).

MIPS is a _load-store_ architecture (also sometimes called _"register-register"_), meaning it only performs arithmetic and logic operations between CPU registers, requiring load/store instructions to access memory (as opposed to a _"register-memory"_ architecture, like x86).

The parser recognizes MIPS Assembly language, and produces segment-based AST, which can be used directly for interpretation, implementing a MIPS virtual machine, or emitting an actual bytecode corresponding to the instructions.

### Installation

```
git clone https://github.com/DmitrySoshnikov/mips-parser.git
cd mips-parser
npm install
npm run build

./bin/mips-parser --help
```

### Usage as a CLI

MIPS parser can be used as a CLI tool, to parser a file:

```
./bin/mips-parser -f ~/example.s
```

Or direct expressions for quick syntax checks:

```
./bin/mips-parser -e 'li $v0, 4'
```

### Usage from Node

The parser can also be used as a Node module:

```js
const MIPSParser = require('mips-parser');

const source = `
  li $v0, 4
  la $a0, message
  syscall
`;

console.log(MIPSParser.parse(source)); // MIPS AST
```

### Examples

A basic MIPS program:

```asm
# Hello, world!
# MIPS Assembly

      .data               # Data segment

# String to be printed:
out_string: .asciiz "Hello, world!"

      .text               # Code segment (instructions go here)

main:                     # Main entry point

      li $v0, 4           # System call code for printing string = 4
      la $a0, out_string  # Load address of string into $a0
      syscall             # Call operating system to perform operation
                          # specified in $v0
                          # syscall takes its arguments from $a0, $a1, etc.

      li $v0, 10          # Terminate the program
      syscall
```

We get the following AST, which can be interpreted by a virtual machine:

```json
{
  "type": "Program",
  "segments": {
    ".text": {
      "instructions": [
        {
          "type": "Instruction",
          "opcode": "li",
          "operands": [
            {
              "type": "Register",
              "value": "$v0",
              "kind": "Name"
            },
            {
              "type": "Number",
              "kind": "decimal",
              "value": "4"
            }
          ]
        },
        {
          "type": "Instruction",
          "opcode": "la",
          "operands": [
            {
              "type": "Register",
              "value": "$a0",
              "kind": "Name"
            },
            {
              "type": "Identifier",
              "value": "out_string"
            }
          ]
        },
        {
          "type": "Instruction",
          "opcode": "syscall"
        },
        {
          "type": "Instruction",
          "opcode": "li",
          "operands": [
            {
              "type": "Register",
              "value": "$v0",
              "kind": "Name"
            },
            {
              "type": "Number",
              "kind": "decimal",
              "value": "10"
            }
          ]
        },
        {
          "type": "Instruction",
          "opcode": "syscall"
        }
      ]
    },
    ".data": {
      "instructions": [
        {
          "type": "Data",
          "mode": ".asciiz",
          "value": {
            "type": "String",
            "value": "Hello, world!"
          }
        }
      ]
    }
  },
  "labels": {
    "out_string": {
      "address": 0,
      "segment": ".data"
    },
    "main": {
      "address": 0,
      "segment": ".text"
    }
  },
  "directives": [
    {
      "type": "Segment",
      "value": ".data",
    },
    {
      "type": "Segment",
      "value": ".text",
    }
  ]
}
```

### Implementation

The `mips-parser` is implemented using [Syntax](https://github.com/DmitrySoshnikov/syntax) tool, which generates a LALR(1) parser based on the MIPS [grammar](https://github.com/DmitrySoshnikov/mips-parser/mips.g).