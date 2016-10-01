const MIPSParser = require('../index');

describe('MIPS Parser', () => {

  it('basic-instructions', () => {
    expect(MIPSParser.parse(`
      li $v0, 4
      la $a0, message
      syscall
    `)).toEqual({
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
                  "value": "message"
                }
              ]
            },
            {
              "type": "Instruction",
              "opcode": "syscall"
            }
          ]
        }
      },
      "labels": {},
      "directives": []
    });
  });


});