const MIPSParser = require('../index');

describe('MIPS Parser', () => {

  it('basic instructions', () => {
    const program = MIPSParser.parse(`
      .text             # code segment

      li $v0, 4         # load 4 to $v0
      la $a0, message   # load address of the message to $a0
      syscall           # call operating system

    `);

    expect(program).toEqual({
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
                  "value": 4
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
      "directives": [
        {
          "type": "Segment",
          "value": ".text"
        }
      ]
    });
  });

  // ----------------------------------------------

  it('text segment created automatically', () => {
    const program = MIPSParser.parse(`
      li $v0, 4
    `);
    expect(program.segments['.text']).toBeDefined();
  });

  it('comments', () => {
    let program = MIPSParser.parse(`
      li $v0, 4 # at new line
      li $v0, 5 # at EOF
    `);
    expect(program.segments['.text']).toBeDefined();

    program = MIPSParser.parse(`
      li $v0, 4 #
      li $v0, 5 #
    `);
    expect(program.segments['.text']).toBeDefined();
  });

  it('data declaration', () => {
    const program = MIPSParser.parse(`

          .data

      foo:   .word 0x15
      bar:   .byte 27
      baz:   .half 100
      qux:   .double 230.5

      array: .byte 4, 5, 7

      str:   .ascii "Hello world!"
      sz:    .asciiz "Value"

      expr:  .space 40 * 2

    `);

    const data = program.segments['.data'].instructions;
    const {foo, bar, baz, qux, array, str, sz, expr} = program.labels;

    const check = (label, mode, value) => {
      const object = data[label.address];
      const valueNode = object.value;

      const objectValue = Array.isArray(valueNode)
        ? valueNode.map(item => item.value)
        : valueNode.value;

      expect(object.type).toBe('Data');
      expect(object.mode).toBe(mode);
      expect(objectValue).toEqual(value);
    };

    check(foo,   '.word',   0x15);
    check(bar,   '.byte',   27);
    check(baz,   '.half',   100);
    check(qux,   '.double', 230.5);
    check(array, '.byte',   [4, 5, 7]);
    check(str,   '.ascii',  'Hello world!');
    check(sz,    '.asciiz', 'Value');

    expect(data[expr.address]).toEqual({
      "type": "Data",
      "mode": ".space",
      "value": {
        "type": "Binary",
        "operator": "*",
        "left": {
          "type": "Number",
          "kind": "decimal",
          "value": 40
        },
        "right": {
          "type": "Number",
          "kind": "decimal",
          "value": 2
        }
      }
    });

  });

  // ----------------------------------------------

  it('multiple labels, same location, outside label', () => {
    const program = MIPSParser.parse(`
          .text

      main:
            li $t0, 4
            j foo
            nop
            li $v0, 5
            j bar
            nop

      foo:
      bar:
            li $t1, 3

      baz:  # label to outside location
    `);

    const {foo, bar, baz} = program.labels;
    const instructions = program.segments['.text'].instructions;

    // Both labels point to the same address.
    expect(foo.address).toBe(6);
    expect(bar.address).toBe(foo.address);

    // li $t1, 3
    expect(instructions[foo.address]).toEqual({
      "type": "Instruction",
      "opcode": "li",
      "operands": [
        {
          "type": "Register",
          "value": "$t1",
          "kind": "Name"
        },
        {
          "type": "Number",
          "kind": "decimal",
          "value": 3
        }
      ]
    });

    // Final label to no instruction.
    expect(baz.address).toBe(7);
    expect(instructions[baz.address]).not.toBeDefined();

  });


});